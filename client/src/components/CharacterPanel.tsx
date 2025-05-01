import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader
} from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import Achievements from './Achievements';
import { Avatar } from './Avatar';

const StatBar: React.FC<{ name: string; value: number; color: string }> = ({ name, value, color }) => {
  return (
    <div className="stat-item">
      <div className="flex justify-between mb-1">
        <span className="text-sm">{name}</span>
        <span className="text-xs font-medium">{value}%</span>
      </div>
      <Progress value={value} className={`h-2.5 ${color}`} />
    </div>
  );
};

const getStatColor = (area: string): string => {
  switch (area) {
    case 'mathematics':
      return 'bg-secondary';
    case 'languages':
      return 'bg-accent';
    case 'sciences':
      return 'bg-blue-500';
    case 'history':
      return 'bg-red-500';
    case 'geography':
      return 'bg-green-500';
    case 'arts':
      return 'bg-purple-500';
    default:
      return 'bg-primary';
  }
};

const calculateAreaProgress = (
  missions: any[], 
  userProgress: any[], 
  area: string
): number => {
  const areaMissions = missions.filter(m => m.area === area);
  if (areaMissions.length === 0) return 0;
  
  const completedMissions = userProgress.filter(
    p => p.completed && areaMissions.some(m => m.id === p.missionId)
  );
  
  return Math.round((completedMissions.length / areaMissions.length) * 100);
};

const CharacterPanel: React.FC = () => {
  const { user } = useAuth();
  const { missions, userProgress, achievements, userAchievements } = useGame();

  if (!user) return null;

  const stats = [
    { name: 'Matemática', area: 'mathematics' },
    { name: 'Linguagens', area: 'languages' },
    { name: 'Ciências', area: 'sciences' },
    { name: 'História', area: 'history' },
    { name: 'Geografia', area: 'geography' },
    { name: 'Artes', area: 'arts' }
  ];

  // Calculate XP needed for next level (simple formula)
  const xpPerLevel = 1000;
  const nextLevelXP = user.level * xpPerLevel;
  const currentLevelXP = (user.level - 1) * xpPerLevel;
  const xpProgress = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  const xpNeeded = nextLevelXP - user.xp;

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Character Avatar */}
      <div className="flex flex-col items-center mb-6 pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-light border-4 border-accent overflow-hidden shadow-lg">
            <Avatar size="large" user={user} />
          </div>
          <span className="absolute -top-2 -right-2 bg-accent text-dark text-xs font-bold px-2 py-1 rounded-full">
            Nv. {user.level}
          </span>
        </div>
        
        <h2 className="mt-4 font-medieval text-xl">{user.username}</h2>
        <p className="text-parchment-dark text-sm">Aprendiz de Sabedoria</p>
      </div>
      
      {/* Character Stats */}
      <Card className="bg-dark border-none shadow-none mb-6">
        <CardHeader className="p-4 pb-2">
          <h3 className="font-cinzel text-accent text-center">Atributos</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {stats.map(stat => (
            <StatBar 
              key={stat.area} 
              name={stat.name} 
              value={calculateAreaProgress(missions, userProgress, stat.area)} 
              color={getStatColor(stat.area)} 
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Achievements */}
      <Card className="bg-dark border-none shadow-none mb-6">
        <CardHeader className="p-4 pb-2">
          <h3 className="font-cinzel text-accent text-center">Conquistas</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Achievements 
            achievements={achievements} 
            userAchievements={userAchievements}
          />
        </CardContent>
      </Card>
      
      {/* XP Progress */}
      <Card className="bg-dark border-none shadow-none mt-auto">
        <CardContent className="p-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Nível {user.level}</span>
            <span className="text-sm">{user.xp}/{nextLevelXP} XP</span>
          </div>
          <Progress value={xpProgress} className="h-3 bg-dark-dark mb-1">
            <div className="bg-accent h-full rounded-full" />
          </Progress>
          <p className="text-xs text-parchment-dark text-center">
            {xpNeeded} XP para o próximo nível
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterPanel;
