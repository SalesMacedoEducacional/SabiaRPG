import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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

// Importações dos componentes de abas
import ManagerSchoolRegistration from '../components/manager/ManagerSchoolRegistration';
import ManagerProfile from '../components/manager/ManagerProfile';

/**
 * Dashboard do Gestor - Versão com tema escuro medieval
 * Este componente substitui ambos ManagerDashboardNew e ManagerDashboardOld
 */
export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  
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

  // Se o gestor não estiver logado, redirecionar para a página de login
  if (!user) {
    navigate("/auth");
    return null;
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
            <TabsTrigger 
              value="general" 
              className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]"
            >
              <Home size={16} />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]"
            >
              <FileBarChart2 size={16} />
              Relatórios
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]"
            >
              <Settings size={16} />
              Configurações
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-200 hover:text-white bg-[#3e2a18]"
            >
              <User size={16} />
              Meu Perfil
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Visão Geral */}
          <TabsContent value="general">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">
                    Total de Escolas Vinculadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="text-3xl font-bold text-white mb-1">0</div>
                  <p className="text-xs text-gray-300">0 ativas</p>
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
                  <p className="text-xs text-gray-300">Em todas as escolas</p>
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
                  <p className="text-xs text-gray-300">Em todas as escolas</p>
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
                  <p className="text-xs text-gray-300">Distribuídas em todas as escolas</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Ações Rápidas */}
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm font-medium text-white">Ações Rápidas</CardTitle>
                  <CardDescription className="text-xs text-gray-300">
                    Acesso direto às principais tarefas administrativas
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-0 space-y-2">
                  <Button 
                    className="w-full bg-[#3e2a18] hover:bg-[#a85f16] text-white border-none flex items-center gap-2"
                    onClick={() => navigate('/user-registration')}
                  >
                    <User className="h-4 w-4" />
                    Cadastrar Novo Usuário
                  </Button>
                  
                  <Button 
                    className="w-full bg-[#3e2a18] hover:bg-[#a85f16] text-white border-none flex items-center gap-2"
                    onClick={() => navigate('/school-registration')}
                  >
                    <School className="h-4 w-4" />
                    Cadastrar Nova Escola
                  </Button>
                  
                  <Button 
                    className="w-full bg-[#3e2a18] hover:bg-[#a85f16] text-white border-none flex items-center gap-2"
                    onClick={() => navigate('/class-registration')}
                  >
                    <BookOpen className="h-4 w-4" />
                    Gerenciar Turmas
                  </Button>
                </CardContent>
              </Card>
              
              {/* Alunos Ativos */}
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm font-medium text-white">Alunos Ativos na Plataforma</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-3xl font-bold text-white">0</div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mb-4">
                    <div>Últimos 7 dias</div>
                    <div>Últimos 30 dias</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Alerta de Evasão */}
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm font-medium text-white">Alerta de Evasão Potencial</CardTitle>
                  <CardDescription className="text-xs text-gray-300">
                    Alunos com mais de 30 dias sem acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="text-3xl font-bold text-white my-4">0</div>
                  <Button 
                    className="w-full bg-[#3e2a18] hover:bg-[#a85f16] text-white border-none"
                  >
                    Ver Lista
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Escolas com Maior Engajamento */}
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm font-medium text-white">Escolas com Maior Engajamento</CardTitle>
                  <CardDescription className="text-xs text-gray-300">
                    Escolas com melhores taxas de participação
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-4 flex items-center justify-center text-white">
                  <p>Nenhuma escola cadastrada</p>
                </CardContent>
              </Card>
              
              {/* Atividade Recente */}
              <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
                <CardHeader className="px-4 py-2">
                  <CardTitle className="text-sm font-medium text-white">Atividade Recente</CardTitle>
                  <CardDescription className="text-xs text-gray-300">
                    Últimas ações e eventos no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-4 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#231f20] p-2 rounded-full">
                      <FileBarChart2 className="h-4 w-4 text-[#a85f16]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Novo relatório gerado</p>
                      <p className="text-xs text-gray-300">Relatório bimestral da Escola Municipal Pedro II</p>
                      <p className="text-xs text-gray-400">Hoje, 09:45</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-[#231f20] p-2 rounded-full">
                      <Users className="h-4 w-4 text-[#a85f16]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Novos usuários cadastrados</p>
                      <p className="text-xs text-gray-300">12 alunos adicionados à plataforma</p>
                      <p className="text-xs text-gray-400">Ontem, 15:30</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-[#231f20] p-2 rounded-full">
                      <AlertCircle className="h-4 w-4 text-[#a85f16]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Alerta de engajamento</p>
                      <p className="text-xs text-gray-300">Queda de atividade em 2 turmas do 8º ano</p>
                      <p className="text-xs text-gray-400">12/05, 13:15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab de Relatórios */}
          <TabsContent value="reports">
            <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
              <CardHeader>
                <CardTitle className="text-white">Relatórios</CardTitle>
                <CardDescription className="text-gray-300">
                  Gere relatórios detalhados sobre o desempenho dos alunos e escolas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-white">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Configurações */}
          <TabsContent value="settings">
            <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none">
              <CardHeader>
                <CardTitle className="text-white">Configurações</CardTitle>
                <CardDescription className="text-gray-300">
                  Ajuste as configurações do sistema e preferências de notificações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-white">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Perfil */}
          <TabsContent value="profile">
            <ManagerProfile userId={user?.id || ''} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}