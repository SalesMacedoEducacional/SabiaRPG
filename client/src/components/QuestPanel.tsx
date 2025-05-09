import React, { useState } from 'react';
import { Link } from 'wouter';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent 
} from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Scroll } from 'lucide-react';
import { Badge } from './ui/badge';

interface QuestCardProps {
  mission: {
    id: number;
    title: string;
    description: string;
    area: string;
    difficulty: number;
    xpReward: number;
    pathId: number;
    estimatedTime: number;
  };
  progress?: {
    completed: boolean;
    score?: number;
    attempts: number;
  };
  onClick: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ mission, progress, onClick }) => {
  const getAreaColor = (area: string) => {
    switch (area) {
      case 'mathematics': return 'bg-secondary text-dark';
      case 'languages': return 'bg-accent text-dark';
      case 'sciences': return 'bg-blue-500 text-white';
      case 'history': return 'bg-red-600 text-white';
      case 'geography': return 'bg-green-500 text-white';
      case 'arts': return 'bg-purple-500 text-white';
      default: return 'bg-primary text-parchment';
    }
  };

  const getAreaLabel = (area: string) => {
    switch (area) {
      case 'mathematics': return 'Matemática';
      case 'languages': return 'Linguagens';
      case 'sciences': return 'Ciências';
      case 'history': return 'História';
      case 'geography': return 'Geografia';
      case 'arts': return 'Artes';
      default: return area;
    }
  };

  // Calculate progress percentage
  const progressPercentage = progress ? (progress.completed ? 100 : (progress.attempts * 20)) : 0;

  return (
    <Card 
      className="bg-dark rounded-lg overflow-hidden shadow-lg border border-primary hover:border-accent cursor-pointer transition duration-150 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="bg-primary-dark px-4 py-2 border-b border-primary">
        <div className="flex justify-between items-center">
          <h3 className="font-cinzel text-lg truncate mr-2">{mission.title}</h3>
          <Badge className={getAreaColor(mission.area)}>
            {getAreaLabel(mission.area)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-parchment-light mb-4 line-clamp-2">{mission.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <svg className="text-accent mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="text-xs">{mission.xpReward} XP</span>
          </div>
          <div className="flex items-center">
            {progress && (
              <>
                <span className="text-xs mr-2">
                  {progress.completed ? 'Completa' : `${progress.attempts}/5`}
                </span>
                <div className="w-24 bg-dark-dark rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </>
            )}
            {!progress && (
              <span className="text-xs text-parchment-dark">Não iniciada</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuestPanel: React.FC = () => {
  const { missions, userProgress, learningPaths, startMission } = useGame();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');

  if (!user) return null;

  const getProgressForMission = (missionId: number) => {
    return userProgress.find(p => p.missionId === missionId);
  };

  // Filter missions based on tab
  const activeMissions = missions.filter(mission => {
    const progress = getProgressForMission(mission.id);
    return progress && !progress.completed;
  });

  const completedMissions = missions.filter(mission => {
    const progress = getProgressForMission(mission.id);
    return progress && progress.completed;
  });

  const availableMissions = missions.filter(mission => {
    const progress = getProgressForMission(mission.id);
    const path = learningPaths.find(p => p.id === mission.pathId);
    return !progress && path && path.requiredLevel <= user.level;
  });

  const handleMissionClick = (missionId: number) => {
    startMission(missionId);
  };

  return (
    <div className="bg-dark-light border-t border-primary p-4 md:h-1/3 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <h2 className="font-medieval text-2xl text-accent">Missões</h2>
          <div className="ml-auto">
            <Link href="/mission/active">
              <Button variant="primary" className="p-2 bg-primary text-parchment rounded-lg hover:bg-primary-dark transition duration-150 flex items-center">
                <Scroll className="mr-2 h-4 w-4" />
                <span>Ver Todas</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-dark border border-primary rounded-lg mb-4">
            <TabsTrigger value="active" className="data-[state=active]:bg-primary">
              Ativas ({activeMissions.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-primary">
              Disponíveis ({availableMissions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary">
              Concluídas ({completedMissions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            <ScrollArea className="h-56 md:h-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMissions.length > 0 ? (
                  activeMissions.map(mission => (
                    <QuestCard 
                      key={mission.id} 
                      mission={mission} 
                      progress={getProgressForMission(mission.id)}
                      onClick={() => handleMissionClick(mission.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-parchment-dark">
                    <div className="font-medieval text-lg mb-2">Nenhuma missão ativa</div>
                    <p className="text-sm">Inicie uma nova missão disponível para continuar sua jornada</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="available" className="mt-0">
            <ScrollArea className="h-56 md:h-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMissions.length > 0 ? (
                  availableMissions.map(mission => (
                    <QuestCard 
                      key={mission.id} 
                      mission={mission}
                      onClick={() => handleMissionClick(mission.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-parchment-dark">
                    <div className="font-medieval text-lg mb-2">Nenhuma missão disponível</div>
                    <p className="text-sm">Complete as missões ativas ou aumente seu nível para desbloquear novas missões</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <ScrollArea className="h-56 md:h-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMissions.length > 0 ? (
                  completedMissions.map(mission => (
                    <QuestCard 
                      key={mission.id} 
                      mission={mission} 
                      progress={getProgressForMission(mission.id)}
                      onClick={() => handleMissionClick(mission.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-parchment-dark">
                    <div className="font-medieval text-lg mb-2">Nenhuma missão concluída</div>
                    <p className="text-sm">Complete missões para ver seu progresso aqui</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuestPanel;
