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
      icon: <School size={24} className="text-white" /> 
    },
    { 
      title: 'Professores', 
      value: 0, 
      icon: <Users size={24} className="text-white" /> 
    },
    { 
      title: 'Alunos', 
      value: 0, 
      icon: <Book size={24} className="text-white" /> 
    },
    { 
      title: 'Turmas Ativas', 
      value: 0, 
      icon: <BookOpen size={24} className="text-white" /> 
    },
    { 
      title: 'Alunos Ativos',
      value: 0,
      icon: <Users size={24} className="text-white" />
    },
    { 
      title: 'Missões Pendentes', 
      value: 0, 
      icon: <Clock size={24} className="text-white" /> 
    },
    { 
      title: 'Notificações', 
      value: 0, 
      icon: <Bell size={24} className="text-white" /> 
    },
    { 
      title: 'Alertas de Evasão', 
      value: 0, 
      icon: <AlertCircle size={24} className="text-white" />,
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
      <div className="flex flex-col items-center justify-center h-screen bg-[#231f20] text-white">
        <div className="w-16 h-16 border-4 border-[#a85f16] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Carregando dashboard...</p>
      </div>
    );
  }
  
  if (managerError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#231f20] text-white">
        <AlertCircle size={64} className="text-[#a85f16] mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar dashboard</h2>
        <p className="text-gray-400 mb-4">Não foi possível carregar as informações do gestor.</p>
        <Button onClick={() => navigate("/auth")} className="bg-[#3e2a18] hover:bg-[#a85f16] text-white">Voltar para Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#231f20]">
      {/* Header */}
      <header className="bg-[#231f20] border-b border-[#a85f16] shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">DASHBOARD DO GESTOR</h1>
            <p className="text-gray-300">
              Bem-vindo, gestor!
            </p>
          </div>
          <Button 
            variant="destructive"
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid grid-cols-4 gap-1 bg-[#231f20]">
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]">
              <Home size={16} />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]">
              <FileBarChart2 size={16} />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]">
              <Settings size={16} />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]">
              <User size={16} />
              Meu Perfil
            </TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Visão Geral */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">
                    Total de Escolas Vinculadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="text-3xl font-bold text-white mb-1">1</div>
                  <p className="text-xs text-gray-300">escolas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">
                    Total de Professores
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="text-3xl font-bold text-white mb-1">0</div>
                  <p className="text-xs text-gray-300">sem dados no momento</p>
                </CardContent>
              </Card>
              
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">
                    Total de Alunos
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="text-3xl font-bold text-white mb-1">0</div>
                  <p className="text-xs text-gray-300">sem dados no momento</p>
                </CardContent>
              </Card>
              
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">
                    Turmas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="text-3xl font-bold text-white mb-1">0</div>
                  <p className="text-xs text-gray-300">sem turmas em atividade</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-white text-lg">Ações Rápidas</CardTitle>
                  <CardDescription className="text-gray-400">
                    Acesso às principais tarefas administrativas
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-2">
                  <Button 
                    className="w-full bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                    variant="outline" 
                    onClick={() => setActiveTab("school-registration")}
                  >
                    <School className="mr-2 h-4 w-4" />
                    Cadastrar Nova Escola
                  </Button>
                  <Button 
                    className="w-full bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                    variant="outline" 
                    onClick={() => setActiveTab("user-registration")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Cadastrar Novo Usuário
                  </Button>
                  <Button 
                    className="w-full bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                    variant="outline" 
                    onClick={() => setActiveTab("class-registration")}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Gerenciar Turmas
                  </Button>
                  <Button 
                    className="w-full bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                    variant="outline" 
                    onClick={() => setActiveTab("components-registration")}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    Gerenciar Componentes
                  </Button>
                </CardContent>
              </Card>
              
              <div className="space-y-3">
                <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-white text-lg">Alunos Ativos na Plataforma</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-0 pb-4 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">0</div>
                      <p className="text-xs text-gray-300">Últimos 7 dias</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">0</div>
                      <p className="text-xs text-gray-300">Últimos 30 dias</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-white text-lg flex items-center">
                      Alerta de Evasão Potencial
                      <div className="ml-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">0</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-gray-300">Alunos com mais de 30 dias sem acesso</p>
                    <Button className="w-full mt-2 bg-[#a85f16] hover:bg-[#a85f16]/80 text-white border-none">
                      Ver Lista
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 2: Relatórios */}
          <TabsContent value="reports">
            <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-white text-lg">Relatórios</CardTitle>
                <CardDescription className="text-gray-400">
                  Gere relatórios detalhados sobre o desempenho da escola, turmas e alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-300 py-6 text-center">
                  Funcionalidade de relatórios em desenvolvimento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab 3: Configurações */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-white text-lg">Configurações</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerenciamento de usuários, turmas, componentes e outras configurações
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                      onClick={() => setActiveTab("school-registration")}
                    >
                      <School className="h-8 w-8" />
                      <span>Cadastrar Nova Escola</span>
                    </Button>
                    
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                      onClick={() => setActiveTab("user-registration")}
                    >
                      <Users className="h-8 w-8" />
                      <span>Cadastrar Novo Usuário</span>
                    </Button>
                    
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                      onClick={() => setActiveTab("class-registration")}
                    >
                      <BookOpen className="h-8 w-8" />
                      <span>Gerenciar Turmas</span>
                    </Button>
                    
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-[#3e2a18] border-none text-white hover:bg-[#a85f16]" 
                      onClick={() => setActiveTab("components-registration")}
                    >
                      <Book className="h-8 w-8" />
                      <span>Gerenciar Componentes</span>
                    </Button>
                    
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-[#3e2a18] border-none text-white hover:bg-[#a85f16] opacity-50" 
                      disabled
                    >
                      <FileBarChart2 className="h-8 w-8" />
                      <span>Gerar Relatórios</span>
                    </Button>
                    
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-[#3e2a18] border-none text-white hover:bg-[#a85f16] opacity-50" 
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
            <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-white text-lg">Cadastro de Novos Usuários</CardTitle>
                <CardDescription className="text-gray-400">
                  Formulário para cadastro de alunos, professores e gestores
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-300 py-6 text-center">
                  Formulário de cadastro de usuários em construção.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="class-registration">
            <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-white text-lg">Gerenciamento de Turmas</CardTitle>
                <CardDescription className="text-gray-400">
                  Cadastro e gestão de turmas da escola
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-300 py-6 text-center">
                  Formulário de cadastro de turmas em construção.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="components-registration">
            <Card className="bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-white text-lg">Gerenciamento de Componentes Curriculares</CardTitle>
                <CardDescription className="text-gray-400">
                  Cadastro e gestão de componentes curriculares
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-300 py-6 text-center">
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