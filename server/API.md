# Bishi REST API & Blockchain Verification Layer Specification

## Overview & Architecture

Bishi operates on a **Hybrid Trust Model**:
1. **Centralized Financial Operation:** Bishi circles are managed by Organizers using standard real-world banking rails (UPI, IMPS/NEFT Bank Transfers, Cash receipts). End users never hold cryptocurrency wallets, never install browser extensions like MetaMask, and never pay gas fees.
2. **Decentralized State Anchoring:** The backend acts as a cryptographic custodian. Every critical milestone generates a SHA-256 hash (`0x`-prefixed 64-hex `bytes32`) anchored onto **Ethereum Sepolia Testnet** via a server-side relayer wallet (or deterministic offline simulation when no RPC key is provided).

---

## Standardized Response Shapes

### 1. Standard List Response Format (Dual Format)

We have standardized all list endpoints on a **Dual Compatible Response Shape**:

```json
{
  "success": true,
  "count": 10,
  "total": 42,
  "page": 1,
  "limit": 10,
  "data": [ ... ],
  "<resourceKey>": [ ... ]
}
```

#### Why This Format Was Chosen:
- **`data`**: Conforms to modern REST conventions, enabling standard API consumers, SDKs, and data grids to consume paginated items consistently.
- **`<resourceKey>`** (`groups`, `contributions`, `payouts`, `events`, `documents`, `disputes`, `proofs`, `users`): Guarantees 100% backward compatibility with all React frontend hooks (`src/services/api.ts`) and existing integration test suites.
- **`page`, `limit`, `total`, `count`**: Full pagination metadata returned across all list queries.

### 2. Standard Single Resource Response Format

```json
{
  "success": true,
  "data": { ... },
  "<resourceKey>": { ... }
}
```

### 3. Standard Error Response Format

All error responses return clean JSON (never HTML):

```json
{
  "success": false,
  "error": "ErrorType or Short Reason",
  "message": "Human-readable descriptive error explanation"
}
```

---

## Authentication & Role-Based Access Control (RBAC)

Authentication is handled via JWT bearer tokens in the `Authorization: Bearer <token>` header. Token expiry is **7 days**.

### User Roles & Permissions:
| Role | Capabilities | Write Operations Permitted |
| :--- | :--- | :--- |
| **`organizer`** | Creates circles, records contributions, logs payouts, resolves disputes | All group, contribution, and payout writes |
| **`member`** | Views enrolled groups, confirms receipts/payouts, raises queries | Confirmation and dispute writes |
| **`auditor`** | Independent inspection of cryptographic ledger, contracts, proofs | **STRICTLY READ-ONLY** (403 on all POST/PUT/PATCH/DELETE) |
| **`admin`** | Platform oversight, emergency configuration | Full administrative access |

### Demo Accounts (`password123`):
- **Organizer:** `ananya.d@sunrise-circle.in` (Alias: `ananya@bishi.network`)
- **Member:** `meera.joshi@pune-ventures.com` (Alias: `meera@bishi.network`)
- **Auditor:** `raman.audits@consortium-verify.in` (Alias: `raman@bishi.network`)
- **Admin:** `admin@bishi.network` (`adminpassword123`)

---

## Core Endpoints

### 1. Health Checks
- `GET /health` -> `{ status: "OK", service, network, db, chain, timestamp }`
- `GET /api/health` -> `{ status: "ok", db: "connected"|"memory", chain: "sepolia"|"fallback", contractAddress, timestamp }`

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register`
  - Body: `{ name, email, password, phone, role? }`
  - Restrictions: Role restricted to `'member'` or `'organizer'`. Rejects `'admin'` or `'auditor'` with `400`. Passwords must be >= 8 chars. Duplicate email returns `409 Conflict`.
  - Response: `{ success: true, token, user }` (password hash stripped).
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ success: true, token, user }`.
- `GET /api/auth/me` (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, user, network }`. Returns `401` on invalid/missing/expired token.
- `POST /api/auth/demo-switch-role`
  - Body: `{ role: "organizer" | "member" | "auditor" | "admin" }`
  - Response: `{ success: true, token, user, activeRole }`.
- `GET /api/auth/users`
  - Query: `?role=&page=1&limit=50`
  - Response: Dual list shape (`data` & `users`).

### 3. Dashboard (`/api/dashboard`)
- `GET /api/dashboard/overview` (Role Scoped via `optionalAuth`)
  - Aggregated payload:
    ```json
    {
      "success": true,
      "roleScope": "organizer" | "member" | "public",
      "stats": {
        "totalActiveGroups": 4,
        "totalGroups": 5,
        "totalMembers": 10,
        "totalPooledReserves": 220000,
        "totalContributionsRecorded": 66000,
        "totalPayoutsDistributed": 1240000,
        "pendingContributionsCount": 2,
        "upcomingPayoutsCount": 3,
        "verifiedOnChainCount": 24,
        "openDisputesCount": 1
      },
      "chartData": [
        { "month": "Jun", "contributions": 820000, "payouts": 640000 },
        ...
      ],
      "recentLedger": [ ... ],
      "activeBishis": [ ... ]
    }
    ```
- `GET /api/dashboard/search?q=<query>`
  - Global CMD+K unified search across groups, members, documents, contributions, payouts.
- `GET /api/dashboard/notifications`

### 4. Bishi Groups (`/api/groups`)
- `GET /api/groups`
  - Query: `?category=&status=&search=&page=1&limit=50`
  - Response: Dual list shape (`data` & `groups`).
- `GET /api/groups/:id`
  - Response: Single group with populated members, rules hash, schedule hash, next payout.
- `POST /api/groups` (Protected, Auditor Blocked)
  - Anchors rules hash & payout schedule on Sepolia.
- `POST /api/groups/:id/invite` (Protected, Auditor Blocked)

### 5. Contributions (`/api/contributions`)
- `GET /api/contributions`
  - Query: `?groupId=&bishiId=&memberId=&status=&periodMonth=&page=1&limit=50`
  - Response: Dual list shape (`data` & `contributions`).
- `GET /api/contributions/my-dues` (Protected, Member/Any)
  - Fetches outstanding and recent contributions for the logged-in member across all their groups, enriched with group organizer payee details (UPI ID, bank account, IFSC).
- `GET /api/contributions/pending-confirmations` (Protected, Organizer/Admin)
  - Fetches all contributions in `Submitted` status for groups managed by the organizer.
- `POST /api/contributions/:id/submit-payment` (Protected, Member Only, Auditor Blocked)
  - Body: `{ paymentMethod, utr?, paidAt?, note? }`
  - Lifecycle: transitions `Due` or `Rejected` → `Submitted`. Enforces 12-char alphanumeric UTR for UPI/Bank, rejects duplicate UTR (409), sends Notification to Organizer.
- `POST /api/contributions/:id/organizer-confirm` (Protected, Group Organizer/Admin, Auditor Blocked)
  - Lifecycle: transitions `Submitted` → `Confirmed`. Anchors contribution hash on Sepolia via relayer, logs immutable `LedgerEntry`, and notifies member.
- `POST /api/contributions/:id/organizer-reject` (Protected, Group Organizer/Admin, Auditor Blocked)
  - Body: `{ reason }` (min 3 chars). Transitions `Submitted` → `Rejected`, clears UTR for resubmission, and notifies member.
- `POST /api/contributions/record` (Protected, Organizer/Admin, Auditor Blocked)
  - Computes SHA-256 payload hash and anchors on Sepolia.
- `PATCH /api/contributions/:id/confirm` (Protected, Auditor Blocked)
  - Countersigned member confirmation.

### 6. Payouts (`/api/payouts`)
- `GET /api/payouts`
  - Query: `?groupId=&bishiId=&status=&recipientId=&page=1&limit=50`
  - Response: Dual list shape (`data` & `payouts`).
- `POST /api/payouts/:id/record` (Protected, Auditor Blocked)
  - Records bank disbursement reference and updates hash.
- `PATCH /api/payouts/:id/recipient-confirm` (Protected, Auditor Blocked)
  - Recipient countersigns payout receipt; anchors proof on Sepolia.

### 7. Activity & Ledger (`/api/ledger`)
- `GET /api/ledger`
  - Query: `?groupId=&bishiId=&type=&eventType=&search=&page=1&limit=100`
  - Response: Dual list shape (`data` & `events`).
- `GET /api/ledger/:groupId`

### 8. Documents Vault (`/api/documents`)
- `GET /api/documents`
  - Query: `?groupId=&bishiId=&category=&search=&page=1&limit=50`
  - Response: Dual list shape (`data` & `documents`).
- `GET /api/documents/:id`
- `POST /api/documents/upload` (Protected, Auditor Blocked)
  - Anchors document SHA-256 fingerprint on Sepolia.
- `POST /api/documents/:id/verify-integrity`
  - Validates provided or stored content against immutable on-chain hash. Detects tampering.

### 9. Blockchain Proofs & Explorer (`/api/blockchain`)
- `GET /api/blockchain/proofs`
  - Query: `?page=1&limit=50&status=`
  - Returns unified proofs array where each proof includes: `hash`, `txHash` (or `"fallback"`), `rawTxHash`, `status`, `timestamp`, `recordType`, `recordId`, `groupId`, `groupName`.
- `GET /api/blockchain/records` (Explorer feed)
- `POST /api/blockchain/verify` (Independent Record Verifier)
- `GET /api/blockchain/blocks`
- `GET /api/blockchain/status`

### 10. Disputes (`/api/disputes`)
- `GET /api/disputes`
  - Query: `?groupId=&bishiId=&status=&page=1&limit=50`
  - Response: Dual list shape (`data` & `disputes`).
- `POST /api/disputes` (Protected, Auditor Blocked)
- `PATCH /api/disputes/:id/resolve` (Protected, Auditor Blocked)
