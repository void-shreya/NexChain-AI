import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';

export const MainLayout = () => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
};
