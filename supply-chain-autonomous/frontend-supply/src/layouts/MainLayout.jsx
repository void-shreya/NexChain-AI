import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';
import { HologramModal } from '../components/HologramModal';

export const MainLayout = () => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHoloModalOpen, setIsHoloModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenHoloModal={() => setIsHoloModalOpen(true)}
        />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
      <HologramModal
        isOpen={isHoloModalOpen}
        onClose={() => setIsHoloModalOpen(false)}
      />
    </div>
  );
};
