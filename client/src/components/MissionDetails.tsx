import React from 'react';
import { Button } from './ui/button';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from './ui/badge';
import { Link } from 'wouter';
import { Check, Clock, Star, Lock, Play, HelpCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface MissionDetailsProps {
  missionId: number | null;
}

const MissionDetails: React.FC<MissionDetailsProps> = ({ missionId }) => {
  const { missions, userProgress, startMission } = useGame();
  const { user } = useAuth();

  if (!missionId || !user) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <HelpCircle className="h-16 w-16 text-primary-light mx-auto mb-2 opacity-50" />
          <h2 className="font-medieval text-2xl text-accent">Nenhuma Missão Selecionada</h2>
          <p className="text-parchment-dark text-sm mt-2">Selecione uma missão no mapa ou na lista de missões disponíveis</p>
        </div>
        <Link href="/mission/active">
          <Button variant="accent" className="mt-4">
            Ver Missões Disponíveis
          </Button>
        </Link>
      </div>
    );
  }

  const mission = missions.find(m => m.id === missionId);
  if (!mission) return null;

  const progress = userProgress.find(p => p.missionId === missionId);
  
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

  // Extract mission steps from content
  const missionSteps = mission.content?.steps || [];

  // Determine how many steps have been completed if there's progress
  const completedStepsCount = progress?.score ? Math.floor((progress.score / 100) * missionSteps.length) : 0;

  const handleContinueMission = () => {
    startMission(missionId);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="font-medieval text-2xl text-accent">{mission.title}</h2>
        <p className="text-parchment-dark text-sm">
          {progress?.completed ? 'Missão Concluída' : progress ? 'Missão Ativa' : 'Missão Disponível'}
        </p>
      </div>
      
      {/* Mission Illustration */}
      <div className="mb-6">
        <div className="relative rounded-lg overflow-hidden border-2 border-primary">
          <img 
            src={mission.content?.imageUrl || "https://images.unsplash.com/photo-1515166306024-c66fabf41bc0?q=80&w=1000&auto=format&fit=crop"} 
            alt={mission.title} 
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
          <div className="absolute bottom-2 left-2">
            <Badge className={`
              ${mission.area === 'mathematics' ? 'bg-secondary' : 
                mission.area === 'languages' ? 'bg-accent' : 
                mission.area === 'sciences' ? 'bg-blue-500' : 
                mission.area === 'history' ? 'bg-red-600' : 
                mission.area === 'geography' ? 'bg-green-500' : 
                mission.area === 'arts' ? 'bg-purple-500' : 'bg-primary'} 
              text-dark text-xs font-bold px-2 py-1 rounded-full
            `}>
              {getAreaLabel(mission.area)}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Mission Description */}
      <Card className="bg-dark border-none shadow-none mb-6">
        <CardContent className="p-4">
          <h3 className="font-cinzel text-accent mb-2">Descrição</h3>
          <p className="text-sm text-parchment-light">{mission.description}</p>
          
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center mr-4">
              <Clock className="text-accent mr-1 h-4 w-4" />
              <span>{mission.estimatedTime} min</span>
            </div>
            <div className="flex items-center">
              <Star className="text-accent mr-1 h-4 w-4" />
              <span>{mission.xpReward} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Mission Progress */}
      <Card className="bg-dark border-none shadow-none mb-6">
        <CardContent className="p-4">
          <h3 className="font-cinzel text-accent mb-2">Progresso</h3>
          
          <ul className="space-y-4">
            {missionSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {index < completedStepsCount ? (
                    <div className="w-6 h-6 rounded-full bg-accent-light border-2 border-accent flex items-center justify-center">
                      <Check className="text-dark h-3 w-3" />
                    </div>
                  ) : index === completedStepsCount && progress && !progress.completed ? (
                    <div className="w-6 h-6 rounded-full bg-dark-light border-2 border-accent-light flex items-center justify-center float-animation">
                      <HelpCircle className="text-accent-light h-3 w-3" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-dark-dark border-2 border-primary-dark flex items-center justify-center">
                      <Lock className="text-primary-dark h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className={index > completedStepsCount ? "opacity-50" : ""}>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs text-parchment-dark">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Mission Action */}
      <div className="mt-auto">
        <Link href={`/mission/${missionId}`}>
          <Button 
            onClick={handleContinueMission}
            className="w-full py-3 bg-accent hover:bg-accent-dark text-dark font-bold rounded-lg transition duration-150 flex items-center justify-center"
          >
            <Play className="mr-2 h-4 w-4" />
            {progress?.completed ? 'Revisar Missão' : progress ? 'Continuar Missão' : 'Iniciar Missão'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MissionDetails;
