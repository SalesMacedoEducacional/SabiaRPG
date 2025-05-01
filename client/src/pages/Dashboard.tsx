import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CharacterPanel from '@/components/CharacterPanel';
import MapView from '@/components/MapView';
import QuestPanel from '@/components/QuestPanel';
import MissionDetails from '@/components/MissionDetails';
import LoginModal from '@/components/LoginModal';
import DiagnosticModal from '@/components/DiagnosticModal';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { isFirstAccess, setIsFirstAccess, hasDiagnosticCompleted, activeMissionId } = useGame();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);
  
  // Check if diagnostic is needed
  useEffect(() => {
    if (isAuthenticated && isFirstAccess && !hasDiagnosticCompleted) {
      setShowDiagnosticModal(true);
    }
  }, [isAuthenticated, isFirstAccess, hasDiagnosticCompleted]);
  
  // Handle diagnostic completion
  const handleDiagnosticComplete = () => {
    setIsFirstAccess(false);
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navigation />
        
        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Sidebar (Character Stats) */}
            <aside className="w-full md:w-64 bg-dark-light border-r border-primary flex-shrink-0">
              <CharacterPanel />
            </aside>
            
            {/* Main Game Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <MapView />
              <QuestPanel />
            </div>
            
            {/* Right Sidebar (Current Mission Details) - Hidden on mobile */}
            <aside className="hidden lg:block w-80 bg-dark-light border-l border-primary overflow-y-auto">
              <MissionDetails missionId={activeMissionId} />
            </aside>
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <DiagnosticModal 
        isOpen={showDiagnosticModal} 
        onClose={() => setShowDiagnosticModal(false)}
        onComplete={handleDiagnosticComplete}
      />
    </>
  );
};

export default Dashboard;
