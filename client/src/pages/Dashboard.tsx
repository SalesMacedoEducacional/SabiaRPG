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

interface DashboardProps {
  showDiagnostic?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ showDiagnostic = false }) => {
  const { isAuthenticated, user } = useAuth();
  const { isFirstAccess, setIsFirstAccess, hasDiagnosticCompleted, activeMissionId } = useGame();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(showDiagnostic);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);
  
  // Check if diagnostic is needed (only for students)
  useEffect(() => {
    // Se a propriedade showDiagnostic for definida externamente, ela tem prioridade
    if (showDiagnostic) {
      setShowDiagnosticModal(true);
    } 
    // Caso contrário, verificamos as condições normais para alunos
    else if (isAuthenticated && isFirstAccess && !hasDiagnosticCompleted && user?.role === 'student') {
      setShowDiagnosticModal(true);
    }
  }, [isAuthenticated, isFirstAccess, hasDiagnosticCompleted, user?.role, showDiagnostic]);
  
  // Handle diagnostic completion
  const handleDiagnosticComplete = () => {
    setIsFirstAccess(false);
    localStorage.setItem('diagnostic_completed', 'true');
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
