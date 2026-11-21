import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { BishiGroupsPage } from './pages/BishiGroupsPage';
import { BishiDetailPage } from './pages/BishiDetailPage';
import { CreateBishiPage } from './pages/CreateBishiPage';
import { ContributionsPage } from './pages/ContributionsPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { MembersPage } from './pages/MembersPage';
import { AuditLedgerPage } from './pages/AuditLedgerPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage';
import { DisputesPage } from './pages/DisputesPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated / App Portal Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/groups" element={<BishiGroupsPage />} />
            <Route path="/bishi/:id" element={<BishiDetailPage />} />
            <Route path="/create-bishi" element={<CreateBishiPage />} />
            <Route path="/contributions" element={<ContributionsPage />} />
            <Route path="/payouts" element={<PayoutsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/ledger" element={<AuditLedgerPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/blockchain" element={<BlockchainVerificationPage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
