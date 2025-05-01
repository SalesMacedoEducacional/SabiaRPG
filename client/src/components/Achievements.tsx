import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AchievementProps {
  achievement: {
    id: number;
    title: string;
    description: string;
    iconName: string;
    area: string | null;
  };
  unlocked: boolean;
}

interface AchievementsProps {
  achievements: any[];
  userAchievements: any[];
}

const AchievementIcon: React.FC<AchievementProps> = ({ achievement, unlocked }) => {
  // Map icon names to FontAwesome classes
  const getIconClass = (iconName: string) => {
    switch (iconName) {
      case 'square-root-alt': return 'fa-square-root-alt';
      case 'book': return 'fa-book';
      case 'compass': return 'fa-compass';
      case 'landmark': return 'fa-landmark';
      case 'flask': return 'fa-flask';
      case 'crown': return 'fa-crown';
      default: return 'fa-award';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="achievement flex flex-col items-center" title={achievement.title}>
            <div className={`w-10 h-10 ${unlocked ? 'bg-primary-light' : 'bg-dark-light'} rounded-full flex items-center justify-center ${!unlocked ? 'opacity-40' : ''}`}>
              <i className={`fas ${getIconClass(achievement.iconName)} ${unlocked ? 'text-accent' : 'text-parchment-dark'}`}></i>
            </div>
            <span className="text-xs mt-1 text-center">
              {unlocked ? achievement.title.split(' ')[0] : '???'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-dark border-primary">
          <div className="p-1">
            <p className="font-medieval text-accent">{achievement.title}</p>
            <p className="text-xs text-parchment">
              {unlocked ? achievement.description : 'Conquista bloqueada'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Achievements: React.FC<AchievementsProps> = ({ achievements, userAchievements }) => {
  // Check if achievement is unlocked
  const isUnlocked = (achievementId: number) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  // Display up to 6 achievements
  const displayAchievements = achievements.slice(0, 6);

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayAchievements.map(achievement => (
        <AchievementIcon 
          key={achievement.id} 
          achievement={achievement} 
          unlocked={isUnlocked(achievement.id)} 
        />
      ))}
      
      {/* Fill with empty slots if less than 6 achievements */}
      {achievements.length < 6 && 
        [...Array(6 - achievements.length)].map((_, index) => (
          <div key={`empty-${index}`} className="achievement flex flex-col items-center opacity-30">
            <div className="w-10 h-10 bg-dark-light rounded-full flex items-center justify-center">
              <i className="fas fa-question text-parchment-dark"></i>
            </div>
            <span className="text-xs mt-1 text-center">???</span>
          </div>
        ))
      }
    </div>
  );
};

export default Achievements;
