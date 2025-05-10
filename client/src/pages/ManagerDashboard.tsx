import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { 
  Home, 
  FileBarChart2, 
  Settings, 
  User, 
  LogOut, 
  Book, 
  BookOpen,
  School, 
  Users, 
  Clock, 
  Bell, 
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

// Importações dos componentes de abas
import ManagerSchoolRegistration from '../components/manager/ManagerSchoolRegistration';
import ManagerProfile from '../components/manager/ManagerProfile';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'danger';
  change?: string;
}

interface ManagerInfo {
  id: string;
  hasSchool: boolean;
  schoolId?: string;
  schoolName?: string;
}

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const [managerInfo, setManagerInfo] = useState<ManagerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Buscar informações do gestor, incluindo se ele já tem escola vinculada
  const { data: managerData, isLoading: isManagerLoading, error: managerError } = useQuery({
    queryKey: ['/api/manager/info'], 
    queryFn: async () => {
      try {
        console.log('Obtendo informações do gestor...');
        const response = await api.get('/api/manager/info');
        console.log('Resposta do servidor:', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar informações do gestor:', error);
        throw new Error('Não foi possível carregar as informações do gestor.');
      }
    },
    enabled: !!user // Só executar a query quando o usuário estiver autenticado
  });
  
  useEffect(() => {
    // Verificar se o gestor tem escola vinculada
    if (managerData) {
      console.log('Dados do gestor recebidos:', managerData);
      setManagerInfo(managerData);
      setIsLoading(false);
      
      // Se não tiver escola vinculada, redirecionar para o cadastro de escola
      if (!managerData.hasSchool) {
        console.log('Gestor não tem escola vinculada, redirecionando para cadastro de escola');
        setActiveTab("school-registration");
      } else {
        console.log('Gestor tem escola vinculada:', managerData.schoolName);
      }
    }
  }, [managerData]);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema.",
        variant: "default",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive",
      });
    }
  };
  
  // Array com estatísticas para a visão geral
  const dashboardStats: DashboardStat[] = [
    { 
      title: 'Escolas', 
      value: managerInfo?.hasSchool ? 1 : 0, 
      icon: <School size={24} className="text-accent" /> 
    },
    { 
      title: 'Professores', 
      value: 0, 
      icon: <Users size={24} className="text-secondary" /> 
    },
    { 
      title: 'Alunos', 
      value: 0, 
      icon: <Book size={24} className="text-primary" /> 
    },
    { 
      title: 'Turmas Ativas', 
      value: 0, 
      icon: <BookOpen size={24} className="text-tertiary" /> 
    },
    { 
      title: 'Alunos Ativos',
      value: 0,
      icon: <Users size={24} className="text-secondary" />
    },
    { 
      title: 'Missões Pendentes', 
      value: 0, 
      icon: <Clock size={24} className="text-tertiary" /> 
    },
    { 
      title: 'Notificações', 
      value: 0, 
      icon: <Bell size={24} className="text-primary" /> 
    },
    { 
      title: 'Alertas de Evasão', 
      value: 0, 
      icon: <AlertCircle size={24} className="text-primary" />,
      status: 'warning'
    }
  ];
  
  // Se o gestor não estiver logado, redirecionar para a página de login
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  if (isLoading || isManagerLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Carregando dashboard...</p>
      </div>
    );
  }
  
  if (managerError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle size={64} className="text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar dashboard</h2>
        <p className="text-gray-600 mb-4">Não foi possível carregar as informações do gestor.</p>
        <Button onClick={() => navigate("/auth")}>Voltar para Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1917]">
      {/* Header */}
      <header className="bg-[#292524] border-b border-[#a8742a] shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-medieval text-[#d4a76a]">Dashboard do Gestor</h1>
            <p className="text-[#f5f5dc]">
              {managerInfo?.hasSchool 
                ? `Escola: ${managerInfo?.schoolName}` 
                : 'Nenhuma escola vinculada'}
            </p>
          </div>
          <Button 
            variant="outline"
            className="flex items-center gap-2 border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid grid-cols-4 gap-4 bg-[#292524]">
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-[#d4a76a] data-[state=active]:text-[#1c1917] font-medieval">
              <Home size={16} />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-[#d4a76a] data-[state=active]:text-[#1c1917] font-medieval">
              <FileBarChart2 size={16} />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-[#d4a76a] data-[state=active]:text-[#1c1917] font-medieval">
              <Settings size={16} />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-[#d4a76a] data-[state=active]:text-[#1c1917] font-medieval">
              <User size={16} />
              Meu Perfil
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Visão Geral */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
                <Card key={index} className={`bg-[#292524] border-[#a8742a]
                  ${stat.status === 'warning' ? 'border-l-4 border-l-[#d4a76a]' : ''}
                  ${stat.status === 'danger' ? 'border-l-4 border-l-[#a8742a]' : ''}
                  ${stat.status === 'success' ? 'border-l-4 border-l-[#d4a76a]' : ''}
                `}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium font-medieval text-[#d4a76a]">
                      {stat.title}
                    </CardTitle>
                    <div className="text-[#d4a76a]">
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#f5f5dc]">{stat.value}</div>
                    {stat.change && (
                      <p className={`
                        text-xs mt-1 font-medieval
                        ${stat.change.startsWith('+') ? 'text-[#d4a76a]' : ''}
                        ${stat.change.startsWith('-') ? 'text-[#a8742a]' : ''}
                      `}>
                        {stat.change} desde último mês
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#292524] border-[#a8742a]">
                <CardHeader>
                  <CardTitle className="text-[#d4a76a] font-medieval">Atividades Recentes</CardTitle>
                  <CardDescription className="text-[#d0c8be]">
                    Últimas atividades registradas na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-[#d0c8be] text-center py-6">
                      Nenhuma atividade recente encontrada.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#292524] border-[#a8742a]">
                <CardHeader>
                  <CardTitle className="text-[#d4a76a] font-medieval">Ações Rápidas</CardTitle>
                  <CardDescription className="text-[#d0c8be]">
                    Acesso rápido às principais funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="w-full border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      variant="outline" 
                      onClick={() => setActiveTab("school-registration")}
                    >
                      <School className="mr-2 h-4 w-4" />
                      Gerenciar Escola
                    </Button>
                    <Button 
                      className="w-full border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      variant="outline" 
                      onClick={() => setActiveTab("user-registration")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Gerenciar Usuários
                    </Button>
                    <Button 
                      className="w-full border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      variant="outline" 
                      onClick={() => setActiveTab("class-registration")}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Gerenciar Turmas
                    </Button>
                    <Button 
                      className="w-full border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      variant="outline" 
                      onClick={() => setActiveTab("components-registration")}
                    >
                      <Book className="mr-2 h-4 w-4" />
                      Gerenciar Componentes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab 2: Relatórios */}
          <TabsContent value="reports">
            <Card className="bg-[#292524] border-[#a8742a]">
              <CardHeader>
                <CardTitle className="text-[#d4a76a] font-medieval">Relatórios</CardTitle>
                <CardDescription className="text-[#d0c8be]">
                  Gere relatórios detalhados sobre o desempenho da escola, turmas e alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[#d0c8be] py-6 text-center">
                  Funcionalidade de relatórios em desenvolvimento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab 3: Configurações */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-6">
              <Card className="mb-6 bg-[#292524] border-[#a8742a]">
                <CardHeader>
                  <CardTitle className="text-[#d4a76a] font-medieval">Configurações</CardTitle>
                  <CardDescription className="text-[#d0c8be]">
                    Gerenciamento de usuários, turmas, componentes e outras configurações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center gap-2 border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      onClick={() => setActiveTab("school-registration")}
                    >
                      <School className="h-8 w-8" />
                      <span>Cadastrar Nova Escola</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center gap-2 border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      onClick={() => setActiveTab("user-registration")}
                    >
                      <Users className="h-8 w-8" />
                      <span>Cadastrar Novo Usuário</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center gap-2 border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      onClick={() => setActiveTab("class-registration")}
                    >
                      <BookOpen className="h-8 w-8" />
                      <span>Gerenciar Turmas</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center gap-2 border-[#d4a76a] text-[#d4a76a] hover:bg-[#d4a76a] hover:text-[#1c1917]" 
                      onClick={() => setActiveTab("components-registration")}
                    >
                      <Book className="h-8 w-8" />
                      <span>Gerenciar Componentes</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center gap-2 border-[#d4a76a] text-[#d4a76a] opacity-50" 
                      disabled
                    >
                      <FileBarChart2 className="h-8 w-8" />
                      <span>Gerar Relatórios</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center gap-2 border-[#d4a76a] text-[#d4a76a] opacity-50" 
                      disabled
                    >
                      <Settings className="h-8 w-8" />
                      <span>Preferências do Sistema</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab 4: Meu Perfil */}
          <TabsContent value="profile">
            <ManagerProfile userId={user?.id || ''} />
          </TabsContent>
          
          {/* Conteúdo adicional: Cadastro de Escola */}
          <TabsContent value="school-registration">
            <ManagerSchoolRegistration 
              userId={user?.id || ''} 
              onSchoolRegistered={() => {
                toast({
                  title: "Escola cadastrada com sucesso!",
                  description: "A escola foi vinculada ao seu perfil de gestor.",
                  variant: "default",
                });
                setActiveTab("general");
              }}
            />
          </TabsContent>
          
          {/* Espaços reservados para as outras telas - serão implementadas posteriormente */}
          <TabsContent value="user-registration">
            <Card className="bg-[#292524] border-[#a8742a]">
              <CardHeader>
                <CardTitle className="text-[#d4a76a] font-medieval">Cadastro de Novos Usuários</CardTitle>
                <CardDescription className="text-[#d0c8be]">
                  Formulário para cadastro de alunos, professores e gestores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#d0c8be] py-6 text-center">
                  Formulário de cadastro de usuários em construção.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="class-registration">
            <Card className="bg-[#292524] border-[#a8742a]">
              <CardHeader>
                <CardTitle className="text-[#d4a76a] font-medieval">Gerenciamento de Turmas</CardTitle>
                <CardDescription className="text-[#d0c8be]">
                  Cadastro e gestão de turmas da escola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#d0c8be] py-6 text-center">
                  Formulário de cadastro de turmas em construção.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="components-registration">
            <Card className="bg-[#292524] border-[#a8742a]">
              <CardHeader>
                <CardTitle className="text-[#d4a76a] font-medieval">Gerenciamento de Componentes Curriculares</CardTitle>
                <CardDescription className="text-[#d0c8be]">
                  Cadastro e gestão de componentes curriculares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#d0c8be] py-6 text-center">
                  Formulário de cadastro de componentes em construção.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ManagerDashboard;