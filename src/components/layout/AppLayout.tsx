import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';
import { CommandPalette } from '../common/CommandPalette';
import { RecordPaymentModal } from '../common/RecordPaymentModal';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bone-300 text-bottle-950 flex flex-col selection:bg-bottle-800 selection:text-bone-200">
      <ToastContainer />
      <CommandPalette />
      
      <RecordPaymentModal 
        isOpen={recordPaymentModalOpen} 
        onClose={() => setRecordPaymentModalOpen(false)} 
      />

      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all">
        <Topbar 
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          onOpenRecordPayment={() => setRecordPaymentModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenRecordPayment: () => setRecordPaymentModalOpen(true) }} />
        </main>
      </div>
    </div>
  );
};
