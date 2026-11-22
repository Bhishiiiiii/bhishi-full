import { 
  BishiGroup, 
  Member, 
  ContributionRecord, 
  PayoutRecord, 
  LedgerEvent, 
  DocumentRecord, 
  DisputeRecord, 
  BlockchainBlock, 
  NotificationItem,
  UserRole
} from '../types';

export interface BlockchainProof {
  id: string;
  recordId: string;
  groupId?: string;
  groupName?: string;
  recordType: string;
  hash: string;
  txHash: string;
  rawTxHash?: string;
  blockNumber?: number;
  status: 'Confirmed' | 'Pending' | 'Tamper Alert' | 'Verified' | 'Flagged';
  timestamp: string;
  network?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

class BishiApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('bishi_auth_token') : null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bishi_auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bishi_auth_token');
      localStorage.removeItem('bishi_user');
      localStorage.setItem('bishi_logged_out', 'true');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('bishi_auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const activeToken = this.getToken();
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`;
      
      // Auto-clear session on 401 if user session expired
      if (response.status === 401 && activeToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        this.clearToken();
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const res = await this.request<{ success: boolean; token: string; user: Member }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bishi_logged_out');
      }
    }
    return res;
  }

  async register(data: { name: string; email: string; password: string; phone: string; role?: 'member' | 'organizer' }) {
    const res = await this.request<{ success: boolean; token: string; user: Member }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) {
      this.setToken(res.token);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bishi_logged_out');
      }
    }
    return res;
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: Member }>('/auth/me');
  }

  // Dashboard & Search
  async getDashboardOverview() {
    return this.request<{
      success: boolean;
      roleScope: 'member' | 'organizer' | 'auditor' | 'admin' | 'public';
      stats: {
        totalActiveGroups: number;
        totalGroups: number;
        totalMembers: number;
        totalPooledReserves: number;
        totalContributionsRecorded: number;
        totalPayoutsDistributed: number;
        pendingContributionsCount: number;
        upcomingPayoutsCount: number;
        verifiedOnChainCount: number;
        openDisputesCount: number;
      };
      chartData: Array<{ month: string; contributions: number; payouts: number }>;
      recentLedger: LedgerEvent[];
      activeBishis: BishiGroup[];
    }>('/dashboard/overview');
  }

  async search(query: string) {
    return this.request<{
      success: boolean;
      query: string;
      results: {
        groups: BishiGroup[];
        members: Member[];
        documents: DocumentRecord[];
        contributions: ContributionRecord[];
        payouts: PayoutRecord[];
      };
    }>(`/dashboard/search?q=${encodeURIComponent(query)}`);
  }

  // Groups
  async getGroups(category?: string, status?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (status && status !== 'All') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: BishiGroup[]; groups?: BishiGroup[] }>(`/groups${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total || res.count,
      groups: res.data || res.groups || []
    };
  }

  async getGroup(id: string) {
    const res = await this.request<{ success: boolean; data?: BishiGroup; group?: BishiGroup }>(`/groups/${id}`);
    return {
      success: res.success,
      group: (res.data || res.group)!
    };
  }

  async createBishi(payload: Partial<BishiGroup> & { invitedMembers?: Array<{ name: string; phone: string }> }) {
    return this.request<{ success: boolean; bishi: BishiGroup; blockchainAnchor: any }>('/groups', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async inviteMember(bishiId: string, memberData: { name: string; phone: string; email?: string }) {
    return this.request<{ success: boolean; message: string; inviteLink: string; member: Member }>(`/groups/${bishiId}/invite`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  }

  // Contributions
  async getContributions(params?: { bishiId?: string; groupId?: string; memberId?: string; status?: string; periodMonth?: number }) {
    const qs = new URLSearchParams();
    const targetGroup = params?.groupId || params?.bishiId;
    if (targetGroup && targetGroup !== 'All') qs.append('groupId', targetGroup);
    if (params?.memberId && params.memberId !== 'All') qs.append('memberId', params.memberId);
    if (params?.status && params.status !== 'All') qs.append('status', params.status);
    if (params?.periodMonth) qs.append('periodMonth', String(params.periodMonth));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: ContributionRecord[]; contributions?: ContributionRecord[] }>(`/contributions${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total || res.count,
      contributions: res.data || res.contributions || []
    };
  }

  async recordContribution(data: {
    bishiId: string;
    memberId: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    periodMonth: number;
    monthName: string;
    notes?: string;
  }) {
    return this.request<{ success: boolean; contribution: ContributionRecord; blockchainAnchor: any }>('/contributions/record', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async confirmContribution(id: string) {
    return this.request<{ success: boolean; contribution: ContributionRecord }>(`/contributions/${id}/confirm`, {
      method: 'PATCH'
    });
  }

  // Member Payment Lifecycle API
  async getMyDues() {
    const res = await this.request<{ success: boolean; count: number; data?: ContributionRecord[]; contributions?: ContributionRecord[] }>('/contributions/my-dues');
    return {
      success: res.success,
      count: res.count,
      dues: res.data || res.contributions || []
    };
  }

  async getPendingConfirmations() {
    const res = await this.request<{ success: boolean; count: number; data?: ContributionRecord[]; contributions?: ContributionRecord[] }>('/contributions/pending-confirmations');
    return {
      success: res.success,
      count: res.count,
      pending: res.data || res.contributions || []
    };
  }

  async submitPayment(id: string, data: { paymentMethod: string; utr?: string; paidAt?: string; note?: string }) {
    return this.request<{ success: boolean; message: string; contribution: ContributionRecord }>(`/contributions/${id}/submit-payment`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async organizerConfirmContribution(id: string) {
    return this.request<{ success: boolean; message: string; contribution: ContributionRecord; ledgerEntry: any }>(`/contributions/${id}/organizer-confirm`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  async organizerRejectContribution(id: string, reason: string) {
    return this.request<{ success: boolean; message: string; contribution: ContributionRecord }>(`/contributions/${id}/organizer-reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Payouts
  async getPayouts(params?: { bishiId?: string; groupId?: string; status?: string; recipientId?: string }) {
    const qs = new URLSearchParams();
    const targetGroup = params?.groupId || params?.bishiId;
    if (targetGroup && targetGroup !== 'All') qs.append('groupId', targetGroup);
    if (params?.status && params.status !== 'All') qs.append('status', params.status);
    if (params?.recipientId) qs.append('recipientId', params.recipientId);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: PayoutRecord[]; payouts?: PayoutRecord[] }>(`/payouts${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total || res.count,
      payouts: res.data || res.payouts || []
    };
  }

  async recordPayout(id: string, data: { paymentMethod?: string; transactionRef?: string; proofDocumentUrl?: string }) {
    return this.request<{ success: boolean; payout: PayoutRecord }>(`/payouts/${id}/record`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async confirmPayout(id: string, proofRef?: string) {
    return this.request<{ success: boolean; payout: PayoutRecord; blockchainAnchor: any }>(`/payouts/${id}/recipient-confirm`, {
      method: 'PATCH',
      body: JSON.stringify({ proofRef })
    });
  }

  // Documents & Tamper Detection
  async getDocuments(params?: { bishiId?: string; groupId?: string; category?: string; search?: string }) {
    const qs = new URLSearchParams();
    const targetGroup = params?.groupId || params?.bishiId;
    if (targetGroup && targetGroup !== 'All') qs.append('groupId', targetGroup);
    if (params?.category && params.category !== 'All') qs.append('category', params.category);
    if (params?.search) qs.append('search', params.search);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: DocumentRecord[]; documents?: DocumentRecord[] }>(`/documents${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total || res.count,
      documents: res.data || res.documents || []
    };
  }

  async uploadDocument(data: { bishiId: string; title: string; category: string; content?: string }) {
    return this.request<{ success: boolean; document: DocumentRecord; blockchainAnchor: any }>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async verifyDocumentIntegrity(id: string, contentToTest?: string) {
    return this.request<{
      success: boolean;
      matched: boolean;
      status: string;
      documentTitle: string;
      storedHash: string;
      liveHash: string;
      blockNumber?: number;
      txHash?: string;
      message: string;
    }>(`/documents/${id}/verify-integrity`, {
      method: 'POST',
      body: JSON.stringify({ contentToTest })
    });
  }

  // Blockchain Explorer, Proofs & Verifier
  async getBlockchainProofs(params?: { page?: number; limit?: number; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.status && params.status !== 'All') qs.append('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total: number; mode: string; data?: BlockchainProof[]; proofs?: BlockchainProof[] }>(`/blockchain/proofs${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total,
      mode: res.mode,
      proofs: res.data || res.proofs || []
    };
  }

  async getBlockchainRecords() {
    return this.request<{
      success: boolean;
      count: number;
      records: Array<{
        id: string;
        recordId: string;
        groupId: string;
        groupName: string;
        recordType: string;
        recordHash: string;
        blockNumber: number;
        txHash: string;
        timestamp: string;
        network: string;
        status: string;
        explorerUrl: string;
      }>;
    }>('/blockchain/records');
  }

  async verifyHash(queryHash: string) {
    return this.request<{
      success: boolean;
      matched: boolean;
      verificationStatus: string;
      recordType?: string;
      details?: any;
      blockNumber?: number;
      timestamp?: string;
      merkleProof?: string;
      blockchainTxHash?: string;
      explorerUrl?: string;
      network?: string;
    }>('/blockchain/verify', {
      method: 'POST',
      body: JSON.stringify({ queryHash })
    });
  }

  async getBlocks() {
    return this.request<{ success: boolean; blocks: BlockchainBlock[] }>('/blockchain/blocks');
  }

  async getBlockchainStatus() {
    return this.request<{
      success: boolean;
      status: {
        network: string;
        chainId: number;
        contractAddress: string;
        rpcConnected: boolean;
        currentBlockHeight: number;
        totalAnchoredRecords: number;
        relayerAddress: string;
      };
    }>('/blockchain/status');
  }

  async getUsers(role?: string) {
    const q = role ? `?role=${role}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: Member[]; users?: Member[] }>(`/auth/users${q}`);
    return {
      success: res.success,
      count: res.count,
      users: res.data || res.users || []
    };
  }

  async getNotifications() {
    return this.request<{ success: boolean; count: number; notifications: NotificationItem[] }>('/dashboard/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; message: string }>(`/dashboard/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string }>('/dashboard/notifications/read-all', {
      method: 'PATCH'
    });
  }

  // Activity Ledger
  async getLedger(params?: { bishiId?: string; groupId?: string; eventType?: string; search?: string }) {
    const qs = new URLSearchParams();
    const targetGroup = params?.groupId || params?.bishiId;
    if (targetGroup && targetGroup !== 'All') qs.append('groupId', targetGroup);
    if (params?.eventType && params.eventType !== 'All') qs.append('eventType', params.eventType);
    if (params?.search) qs.append('search', params.search);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: LedgerEvent[]; events?: LedgerEvent[] }>(`/ledger${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total || res.count,
      events: res.data || res.events || []
    };
  }

  // Disputes
  async getDisputes(params?: { bishiId?: string; groupId?: string; status?: string }) {
    const qs = new URLSearchParams();
    const targetGroup = params?.groupId || params?.bishiId;
    if (targetGroup && targetGroup !== 'All') qs.append('groupId', targetGroup);
    if (params?.status && params.status !== 'All') qs.append('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; total?: number; data?: DisputeRecord[]; disputes?: DisputeRecord[] }>(`/disputes${query}`);
    return {
      success: res.success,
      count: res.count,
      total: res.total || res.count,
      disputes: res.data || res.disputes || []
    };
  }

  async raiseDispute(data: {
    bishiId: string;
    category: string;
    targetRecordId: string;
    targetRecordType: string;
    description: string;
    evidenceUrl?: string;
  }) {
    return this.request<{ success: boolean; dispute: DisputeRecord }>('/disputes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async resolveDispute(id: string, organizerResponse: string, status: 'Resolved' | 'Rejected') {
    return this.request<{ success: boolean; dispute: DisputeRecord }>(`/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ status, organizerResponse })
    });
  }
}

export const api = new BishiApiClient();
export default api;
