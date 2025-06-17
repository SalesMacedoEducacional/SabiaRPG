import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface GameContextType {
  locations: Location[];
  learningPaths: LearningPath[];
  missions: Mission[];
  userProgress: UserProgress[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  activeMissionId: number | null;
  setActiveMissionId: (id: number | null) => void;
  isFirstAccess: boolean;
  setIsFirstAccess: (value: boolean) => void;
  hasDiagnosticCompleted: boolean;
  updateUserProgress: (progressData: Partial<UserProgress>) => Promise<void>;
  startMission: (missionId: number) => Promise<void>;
  completeMission: (missionId: number, score: number) => Promise<void>;
  isLoading: boolean;
}

interface Location {
  id: number;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  icon: string;
  unlockLevel: number;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  area: string;
  difficulty: number;
  requiredLevel: number;
  imageUrl?: string;
  locationId: number;
}

interface Mission {
  id: number;
  title: string;
  description: string;
  area: string;
  difficulty: number;
  xpReward: number;
  pathId: number;
  content: any;
  estimatedTime: number;
  sequence: number;
}

interface UserProgress {
  id?: number;
  userId: number;
  missionId: number;
  completed: boolean;
  score?: number;
  attempts: number;
  feedback?: string;
  completedAt?: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  area: string | null;
  iconName: string;
  criteria: any;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'manager';
  avatarUrl?: string;
  level: number;
  xp: number;
  createdAt: string;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeMissionId, setActiveMissionId] = useState<number | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState<boolean>(false);
  const [hasDiagnosticCompleted, setHasDiagnosticCompleted] = useState<boolean>(false);
  
  // Get current auth status from AuthContext
  const { user, isAuthenticated } = useAuth();
  
  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
    enabled: isAuthenticated,
  });

  // Fetch learning paths
  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery<LearningPath[]>({
    queryKey: ['/api/learning-paths'],
    enabled: isAuthenticated,
  });

  // Fetch missions
  const { data: missions = [], isLoading: missionsLoading } = useQuery<Mission[]>({
    queryKey: ['/api/missions'],
    enabled: isAuthenticated,
  });

  // Fetch user progress
  const { data: userProgress = [], isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ['/api/user-progress'],
    enabled: isAuthenticated,
  });

  // Fetch achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    enabled: isAuthenticated,
  });

  // Fetch user achievements
  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery<UserAchievement[]>({
    queryKey: ['/api/user-achievements'],
    enabled: isAuthenticated,
  });

  // Fetch user diagnostics
  const { data: userDiagnostics = [], isLoading: diagnosticsLoading } = useQuery<any[]>({
    queryKey: ['/api/user-diagnostics'],
    enabled: isAuthenticated,
  });

  // Mutation to update user progress
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: Partial<UserProgress>) => {
      const { id, ...data } = progressData;
      if (id) {
        const response = await apiRequest('PATCH', `/api/user-progress/${id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/user-progress', {
          ...data,
          userId: user?.id,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar progresso",
        description: error.message || "Não foi possível atualizar seu progresso. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Check if user is on first access
  useEffect(() => {
    if (user && userProgress && userDiagnostics) {
      const isFirstTime = userProgress.length === 0;
      setIsFirstAccess(isFirstTime);
      setHasDiagnosticCompleted(userDiagnostics.length > 0);
    }
  }, [user, userProgress, userDiagnostics]);

  const updateUserProgress = async (progressData: Partial<UserProgress>) => {
    await updateProgressMutation.mutateAsync(progressData);
  };

  const startMission = async (missionId: number) => {
    const existingProgress = userProgress.find(p => p.missionId === missionId);
    
    if (existingProgress) {
      await updateProgressMutation.mutateAsync({
        id: existingProgress.id,
        attempts: existingProgress.attempts + 1
      });
    } else {
      await updateProgressMutation.mutateAsync({
        userId: user!.id,
        missionId,
        completed: false,
        attempts: 1
      });
    }
    
    setActiveMissionId(missionId);
  };

  const completeMission = async (missionId: number, score: number) => {
    const existingProgress = userProgress.find(p => p.missionId === missionId);
    
    if (existingProgress) {
      await updateProgressMutation.mutateAsync({
        id: existingProgress.id,
        completed: true,
        score,
        completedAt: new Date().toISOString()
      });
    } else {
      await updateProgressMutation.mutateAsync({
        userId: user!.id,
        missionId,
        completed: true,
        score,
        attempts: 1,
        completedAt: new Date().toISOString()
      });
    }
    
    toast({
      title: "Missão completa!",
      description: `Você conquistou ${missions.find(m => m.id === missionId)?.xpReward || 0} pontos de experiência!`,
    });
  };

  // Combine all loading states
  const isLoading = locationsLoading || pathsLoading || missionsLoading || 
                    progressLoading || achievementsLoading || userAchievementsLoading ||
                    diagnosticsLoading;

  return (
    <GameContext.Provider
      value={{
        locations,
        learningPaths,
        missions,
        userProgress,
        achievements,
        userAchievements,
        activeMissionId,
        setActiveMissionId,
        isFirstAccess,
        setIsFirstAccess,
        hasDiagnosticCompleted,
        updateUserProgress,
        startMission,
        completeMission,
        isLoading
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
