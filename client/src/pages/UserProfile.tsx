import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Avatar } from '@/components/Avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  User as UserIcon,
  Settings,
  Trophy,
  BookOpen,
  Star,
  Upload,
  Save,
  Clock,
  Check,
  BarChart2,
  Award,
  Shield,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Achievements from '@/components/Achievements';
import { useGame } from '@/context/GameContext';

// Profile form schema
const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Nome completo precisa ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  username: z.string().min(3, { message: 'Nome de usuário precisa ter pelo menos 3 caracteres' }),
  avatarUrl: z.string().optional(),
});

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Senha atual precisa ter pelo menos 6 caracteres' }),
  newPassword: z.string().min(6, { message: 'Nova senha precisa ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'Confirme a nova senha' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { achievements, userAchievements, userProgress, missions } = useGame();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      console.log('Enviando atualização de perfil:', data);
      try {
        const response = await fetch(`/api/users/${user?.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include'
        });
        
        console.log('Resposta da atualização:', response.status);
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
          } else {
            const errorText = await response.text();
            console.error('Resposta de erro não-JSON:', errorText);
            throw new Error(`Erro ${response.status}: Formato de resposta inválido`);
          }
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro na atualização do perfil:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o perfil',
        variant: 'destructive',
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const response = await apiRequest('PATCH', `/api/users/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi atualizada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a senha',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submissions
  const onUpdateProfile = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutateAsync(data);
  };
  
  const onUpdatePassword = (data: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutateAsync(data);
  };
  
  // Função para manipular o upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validar o tipo de arquivo
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Formato inválido. Use JPG ou PNG.'
      });
      return;
    }
    
    // Validar o tamanho (máximo 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setUploadStatus({
        type: 'error',
        message: 'Imagem muito grande. O tamanho máximo é 5MB.'
      });
      return;
    }
    
    // Criar URL para pré-visualização
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setUploadStatus(null);
  };
  
  // Remover a imagem selecionada
  const removeSelectedImage = () => {
    setImagePreview(null);
    setUploadStatus(null);
    
    // Limpar o input file
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Upload da imagem para o servidor
  const uploadImage = async () => {
    if (!imagePreview || !user?.id) return;
    
    // Converter a URL para um arquivo
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      setUploadStatus({
        type: 'error',
        message: 'Nenhum arquivo selecionado.'
      });
      return;
    }
    
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/usuarios/${user.id}/foto`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao fazer upload da imagem');
      }
      
      const data = await response.json();
      
      // Atualizar o valor do formulário com a nova URL
      profileForm.setValue('avatarUrl', data.imageUrl);
      
      // Limpar a pré-visualização
      setImagePreview(null);
      
      // Atualizar o estado com mensagem de sucesso
      setUploadStatus({
        type: 'success',
        message: 'Foto de perfil atualizada com sucesso!'
      });
      
      // Atualizar o cache da consulta do usuário
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Falha ao salvar. Tente novamente.'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Calculate XP needed for next level (simple formula)
  const xpPerLevel = 1000;
  const nextLevelXP = user?.level ? user.level * xpPerLevel : xpPerLevel;
  const currentLevelXP = user?.level ? (user.level - 1) * xpPerLevel : 0;
  const xpProgress = user?.xp ? ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;
  const xpNeeded = user?.xp ? nextLevelXP - user.xp : xpPerLevel;
  
  // Calculate progress statistics
  const completedMissions = userProgress.filter(p => p.completed).length;
  const totalMissions = missions.length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  
  // Calculate area stats
  const calculateAreaStats = (area: string) => {
    const areaMissions = missions.filter(m => m.area === area);
    const areaProgress = userProgress.filter(p => 
      p.completed && areaMissions.some(m => m.id === p.missionId)
    );
    
    return {
      completed: areaProgress.length,
      total: areaMissions.length,
      progress: areaMissions.length > 0 ? Math.round((areaProgress.length / areaMissions.length) * 100) : 0,
    };
  };
  
  const areaStats = [
    { name: 'Matemática', area: 'mathematics', color: 'bg-secondary' },
    { name: 'Linguagens', area: 'languages', color: 'bg-accent' },
    { name: 'Ciências', area: 'sciences', color: 'bg-blue-500' },
    { name: 'História', area: 'history', color: 'bg-red-500' },
    { name: 'Geografia', area: 'geography', color: 'bg-green-500' },
    { name: 'Artes', area: 'arts', color: 'bg-purple-500' },
  ].map(stat => ({
    ...stat,
    ...calculateAreaStats(stat.area),
  }));
  
  // Recent activities (mock data)
  const recentActivities = [
    { id: 1, type: 'mission_completed', name: 'Desafio da Torre', area: 'mathematics', score: 85, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 2, type: 'achievement_earned', name: 'Explorador Intrépido', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: 3, type: 'level_up', level: 5, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { id: 4, type: 'mission_completed', name: 'Segredos do Porto', area: 'sciences', score: 70, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { id: 5, type: 'achievement_earned', name: 'Sábio Matemático', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  ];
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-parchment">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-primary-light border-4 border-accent overflow-hidden shadow-lg">
                <Avatar user={user} size="large" />
              </div>
              <span className="absolute -top-2 -right-2 bg-accent text-dark text-sm font-bold px-2 py-1 rounded-full">
                Nv. {user.level}
              </span>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-medieval text-accent">{user.username}</h1>
              <p className="text-parchment-dark">{user.fullName}</p>
              
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-sm mb-1">
                  <span>Nível {user.level}</span>
                  <span>{user.xp}/{nextLevelXP} XP</span>
                </div>
                <Progress value={xpProgress} className="h-3 bg-dark-dark">
                  <div className="bg-accent h-full rounded-full" />
                </Progress>
                <p className="text-xs text-parchment-dark mt-1 text-right">
                  {xpNeeded} XP para o próximo nível
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <Card className="bg-dark-dark border-primary w-28">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-1 text-accent" />
                  <div className="text-xl font-bold">{completedMissions}</div>
                  <div className="text-xs text-parchment-dark">Missões</div>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-dark border-primary w-28">
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 mx-auto mb-1 text-accent" />
                  <div className="text-xl font-bold">{userAchievements.length}</div>
                  <div className="text-xs text-parchment-dark">Conquistas</div>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-dark border-primary w-28">
                <CardContent className="p-4 text-center">
                  <BarChart2 className="h-6 w-6 mx-auto mb-1 text-accent" />
                  <div className="text-xl font-bold">{completionRate}%</div>
                  <div className="text-xs text-parchment-dark">Progresso</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-dark border border-primary">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary">
              <BarChart2 className="mr-2 h-4 w-4" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary">
              <Trophy className="mr-2 h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <Input
                          id="fullName"
                          className="bg-dark border-primary"
                          {...profileForm.register('fullName')}
                        />
                        {profileForm.formState.errors.fullName && (
                          <p className="text-red-500 text-xs mt-1">
                            {profileForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input
                          id="username"
                          className="bg-dark border-primary"
                          {...profileForm.register('username')}
                        />
                        {profileForm.formState.errors.username && (
                          <p className="text-red-500 text-xs mt-1">
                            {profileForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        className="bg-dark border-primary"
                        {...profileForm.register('email')}
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">Foto de Perfil</Label>
                      <div className="flex">
                        <Input
                          id="avatarUrl"
                          className="bg-dark border-primary rounded-r-none"
                          {...profileForm.register('avatarUrl')}
                        />
                        <Button
                          type="button"
                          className="rounded-l-none bg-primary"
                          onClick={() => document.getElementById('profileImage')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar
                        </Button>
                      </div>
                      {imagePreview && (
                        <Button
                          type="button"
                          className="mt-2 bg-accent text-dark"
                          onClick={uploadImage}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Salvar Imagem
                            </>
                          )}
                        </Button>
                      )}
                      <input 
                        type="file" 
                        id="profileImage" 
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <p className="text-xs text-parchment-dark">
                        Cole uma URL de imagem ou clique em enviar para fazer upload (JPG ou PNG, máx 5MB)
                      </p>
                      
                      {/* Preview da imagem selecionada */}
                      {imagePreview && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Pré-visualização:</p>
                          <div className="relative w-32 h-32 border border-primary rounded overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Pré-visualização" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={removeSelectedImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {uploadStatus && (
                        <p className={`text-sm mt-2 ${uploadStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                          {uploadStatus.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="bg-accent text-dark hover:bg-accent-dark"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Suas últimas atividades na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className={`
                          flex-shrink-0 w-10 h-10 rounded-full 
                          ${activity.type === 'mission_completed' ? 'bg-primary/20' : 
                            activity.type === 'achievement_earned' ? 'bg-accent/20' : 
                            'bg-secondary/20'}
                          flex items-center justify-center
                        `}>
                          {activity.type === 'mission_completed' ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : activity.type === 'achievement_earned' ? (
                            <Award className="h-5 w-5 text-accent" />
                          ) : (
                            <Star className="h-5 w-5 text-secondary" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {activity.type === 'mission_completed' ? 'Missão Concluída' : 
                                  activity.type === 'achievement_earned' ? 'Conquista Desbloqueada' : 
                                  'Subiu de Nível'}
                              </p>
                              <p className="text-sm text-parchment-dark">
                                {activity.type === 'mission_completed' ? (
                                  <>
                                    {activity.name} {' '}
                                    <Badge className={`
                                      ${activity.area === 'mathematics' ? 'bg-secondary' : 
                                        activity.area === 'sciences' ? 'bg-blue-500' : 
                                        'bg-primary'} 
                                      text-dark text-xs ml-1
                                    `}>
                                      {activity.score}%
                                    </Badge>
                                  </>
                                ) : activity.type === 'achievement_earned' ? (
                                  activity.name
                                ) : (
                                  <>Alcançou o nível {activity.level}</>
                                )}
                              </p>
                            </div>
                            
                            <div className="flex items-center text-parchment-dark text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(activity.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle>Progresso por Área</CardTitle>
                  <CardDescription>
                    Seu progresso em cada área de conhecimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {areaStats.map(stat => (
                      <div key={stat.area} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${stat.color} mr-2`}></div>
                            <span>{stat.name}</span>
                          </div>
                          <span className="text-sm">
                            {stat.completed}/{stat.total} missões ({stat.progress}%)
                          </span>
                        </div>
                        <Progress value={stat.progress} className={`h-2 ${stat.color}`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>
                    Suas estatísticas gerais na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-dark p-4 rounded-lg border border-primary">
                        <div className="text-sm text-parchment-dark">Missões Concluídas</div>
                        <div className="text-2xl font-bold mt-1">{completedMissions}/{totalMissions}</div>
                        <div className="text-xs text-parchment-dark">{completionRate}% concluído</div>
                      </div>
                      
                      <div className="bg-dark p-4 rounded-lg border border-primary">
                        <div className="text-sm text-parchment-dark">XP Total</div>
                        <div className="text-2xl font-bold mt-1">{user.xp}</div>
                        <div className="text-xs text-parchment-dark">Nível {user.level}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-dark p-4 rounded-lg border border-primary">
                        <div className="text-sm text-parchment-dark">Pontuação Média</div>
                        <div className="text-2xl font-bold mt-1">78%</div>
                        <div className="text-xs text-parchment-dark">Baseado em todas as missões</div>
                      </div>
                      
                      <div className="bg-dark p-4 rounded-lg border border-primary">
                        <div className="text-sm text-parchment-dark">Tempo Médio</div>
                        <div className="text-2xl font-bold mt-1">25 min</div>
                        <div className="text-xs text-parchment-dark">Por missão concluída</div>
                      </div>
                    </div>
                    
                    <div className="bg-dark p-4 rounded-lg border border-primary">
                      <div className="text-sm text-parchment-dark">Ranking Global</div>
                      <div className="flex items-center mt-1">
                        <div className="text-2xl font-bold">#42</div>
                        <div className="text-xs text-parchment-dark ml-2">Entre todos os jogadores</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Missões Recentes</CardTitle>
                <CardDescription>
                  Suas últimas missões concluídas ou em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary hover:bg-transparent">
                      <TableHead>Missão</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pontuação</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missions.slice(0, 5).map((mission, index) => {
                      const progress = userProgress.find(p => p.missionId === mission.id);
                      return (
                        <TableRow key={mission.id} className="border-primary hover:bg-dark">
                          <TableCell>{mission.title}</TableCell>
                          <TableCell>
                            <Badge className={`
                              ${mission.area === 'mathematics' ? 'bg-secondary' : 
                                mission.area === 'languages' ? 'bg-accent' : 
                                mission.area === 'sciences' ? 'bg-blue-500' : 
                                mission.area === 'history' ? 'bg-red-600' : 
                                mission.area === 'geography' ? 'bg-green-500' : 
                                'bg-purple-500'} 
                              ${mission.area === 'mathematics' || mission.area === 'languages' ? 'text-dark' : 'text-white'}
                            `}>
                              {mission.area.charAt(0).toUpperCase() + mission.area.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {progress?.completed ? (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                Concluída
                              </Badge>
                            ) : progress ? (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                Em andamento
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-primary-dark text-primary-dark">
                                Não iniciada
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {progress?.score ? `${progress.score}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {progress?.completedAt ? 
                              formatDate(new Date(progress.completedAt)) : 
                              '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-accent hover:text-accent-light hover:bg-dark"
                              onClick={() => window.location.href = `/mission/${mission.id}`}
                            >
                              {progress?.completed ? 'Revisar' : progress ? 'Continuar' : 'Iniciar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="border-primary w-full"
                  onClick={() => window.location.href = '/mission/active'}
                >
                  Ver Todas as Missões
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Minhas Conquistas</CardTitle>
                <CardDescription>
                  Conquistas desbloqueadas e pendentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map(achievement => {
                    const isUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id);
                    return (
                      <Card key={achievement.id} className={`
                        bg-dark border-primary
                        ${isUnlocked ? 'border-accent/50' : 'opacity-70'}
                      `}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center
                              ${isUnlocked ? 'bg-accent/20' : 'bg-dark-light'}
                            `}>
                              <i className={`
                                fas fa-${achievement.iconName} 
                                ${isUnlocked ? 'text-accent' : 'text-parchment-dark'}
                                text-xl
                              `}></i>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-cinzel text-lg">{achievement.title}</h3>
                              <p className="text-sm text-parchment-dark">{achievement.description}</p>
                            </div>
                          </div>
                          
                          {isUnlocked ? (
                            <div className="mt-3 text-right">
                              <Badge className="bg-accent text-dark">
                                <Shield className="h-3 w-3 mr-1" />
                                Desbloqueado
                              </Badge>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <div className="text-xs text-parchment-dark mb-1 flex justify-between">
                                <span>Progresso</span>
                                <span>25%</span>
                              </div>
                              <Progress value={25} className="h-1" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-dark border-primary"
                        {...passwordForm.register('currentPassword')}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="bg-dark border-primary"
                        {...passwordForm.register('newPassword')}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="bg-dark border-primary"
                        {...passwordForm.register('confirmPassword')}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="bg-accent text-dark hover:bg-accent-dark"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></div>
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Atualizar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>
                  Configure suas preferências de uso da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por email</h4>
                      <p className="text-sm text-parchment-dark">Receber notificações por email</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-primary bg-dark text-accent focus:ring-accent"
                        defaultChecked
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-primary opacity-30" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Lembrete de atividades</h4>
                      <p className="text-sm text-parchment-dark">Lembretes sobre missões não concluídas</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-primary bg-dark text-accent focus:ring-accent"
                        defaultChecked
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-primary opacity-30" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Salvar dados offline</h4>
                      <p className="text-sm text-parchment-dark">Manter dados para acesso offline</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-primary bg-dark text-accent focus:ring-accent"
                        defaultChecked
                      />
                    </div>
                  </div>
                  
                  <Button className="bg-primary hover:bg-primary-dark w-full">
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
