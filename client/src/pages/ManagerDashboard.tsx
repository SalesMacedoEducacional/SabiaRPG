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
  AlertCircle,
  FileText,
  ChevronRight
} from 'lucide-react';

// Importações dos componentes de abas
import ManagerSchoolRegistration from '../components/manager/ManagerSchoolRegistration';
import ManagerProfile from '../components/manager/ManagerProfile';
import { ManagerButton } from '../components/manager/ManagerButton';
import { ManagerCard } from '../components/manager/ManagerCard';

/**
 * Dashboard do Gestor
 * Este componente implementa o dashboard baseado na imagem de referência
 */
export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema.",
        variant: "default",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive",
      });
    }
  };

  // Se o gestor não estiver logado, redirecionar para a página de login
  useEffect(() => {
    if (!user) {
      console.log("Redirecionando para login - usuário não autenticado");
      window.location.href = "/auth";
    }
  }, [user]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <img src="/images/logo-sabia-small.png" alt="SABIÁ RPG" className="h-10" />
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard do Gestor</h1>
              <p className="text-white/80 text-sm">
                Bem-vindo, gestor!
              </p>
            </div>
          </div>
          <ManagerButton 
            onClick={handleLogout}
            className="flex items-center gap-1"
            icon={<LogOut size={14} className="mr-1" />}
          >
            Sair
          </ManagerButton>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-0 py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 gap-0 bg-white border-b border-gray-200 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center py-2 rounded-none border-r border-gray-200 
                data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
            >
              <span className="flex items-center text-gray-800 data-[state=active]:text-primary">
                <Home size={14} className="mr-1.5" />
                Visão Geral
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center justify-center py-2 rounded-none border-r border-gray-200 
                data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
            >
              <span className="flex items-center text-gray-800 data-[state=active]:text-primary">
                <FileBarChart2 size={14} className="mr-1.5" />
                Relatórios
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center justify-center py-2 rounded-none border-r border-gray-200 
                data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
            >
              <span className="flex items-center text-gray-800 data-[state=active]:text-primary">
                <Settings size={14} className="mr-1.5" />
                Configurações
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center py-2 rounded-none 
                data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
            >
              <span className="flex items-center text-gray-800 data-[state=active]:text-primary">
                <User size={14} className="mr-1.5" />
                Meu Perfil
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Visão Geral */}
          <TabsContent value="overview">
            {/* Primeira linha: estatísticas básicas */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <ManagerCard asStatsCard={true}>
                <div className="text-sm font-medium text-primary mb-2">Total de Escolas Vinculadas</div>
                <div className="text-4xl font-bold text-gray-800">0</div>
                <div className="text-xs text-accent mt-1">0 ativas</div>
              </ManagerCard>
              
              <ManagerCard asStatsCard={true}>
                <div className="text-sm font-medium text-primary mb-2">Total de Professores</div>
                <div className="text-4xl font-bold text-gray-800">0</div>
                <div className="text-xs text-accent mt-1">Em todas as escolas</div>
              </ManagerCard>
              
              <ManagerCard asStatsCard={true}>
                <div className="text-sm font-medium text-primary mb-2">Total de Alunos</div>
                <div className="text-4xl font-bold text-gray-800">0</div>
                <div className="text-xs text-accent mt-1">Em todas as escolas</div>
              </ManagerCard>
              
              <ManagerCard asStatsCard={true}>
                <div className="text-sm font-medium text-primary mb-2">Turmas Ativas</div>
                <div className="text-4xl font-bold text-gray-800">0</div>
                <div className="text-xs text-accent mt-1">Distribuídas em todas as escolas</div>
              </ManagerCard>
            </div>
            
            {/* Segunda linha: ações, alunos ativos, alertas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Ações Rápidas */}
              <ManagerCard 
                title="Ações Rápidas"
                description="Acesso direto às principais tarefas administrativas"
              >
                <div className="flex flex-col gap-2">
                  <ManagerButton 
                    variant="action"
                    fullWidth
                    onClick={() => navigate('/user-registration')}
                    icon={<User className="h-4 w-4" />}
                  >
                    <span className="text-white">Cadastrar Novo Usuário</span>
                  </ManagerButton>
                  
                  <ManagerButton
                    variant="action"
                    fullWidth
                    onClick={() => navigate('/school-registration')}
                    icon={<School className="h-4 w-4" />}
                  >
                    <span className="text-white">Cadastrar Nova Escola</span>
                  </ManagerButton>
                  
                  <ManagerButton
                    variant="action"
                    fullWidth
                    onClick={() => navigate('/class-registration')}
                    icon={<BookOpen className="h-4 w-4" />}
                  >
                    <span className="text-white">Gerenciar Turmas</span>
                  </ManagerButton>
                </div>
              </ManagerCard>
              
              {/* Alunos Ativos */}
              <ManagerCard title="Alunos Ativos na Plataforma">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 text-3xl font-bold">0</div>
                    <div className="text-accent text-xs">Últimos 7 dias</div>
                  </div>
                  <div>
                    <div className="text-gray-800 text-3xl font-bold">0</div>
                    <div className="text-accent text-xs">Últimos 30 dias</div>
                  </div>
                </div>
              </ManagerCard>
              
              {/* Alerta de Evasão */}
              <ManagerCard
                title="Alerta de Evasão Potencial"
                description="Alunos com mais de 30 dias sem acesso"
              >
                <div className="text-gray-800 text-4xl font-bold text-center my-4">0</div>
                
                <ManagerButton fullWidth>
                  Ver Lista
                </ManagerButton>
              </ManagerCard>
            </div>
            
            {/* Escolas com maior engajamento e atividade recente */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Escolas com Maior Engajamento */}
              <ManagerCard
                title="Escolas com Maior Engajamento"
                description="Escolas com melhores taxas de participação"
              >
                <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                  <div className="mb-3 text-primary/50">
                    <School size={32} />
                  </div>
                  <p>Nenhuma escola cadastrada</p>
                </div>
              </ManagerCard>
              
              {/* Atividade Recente */}
              <ManagerCard
                title="Atividade Recente"
                description="Últimas ações e eventos no sistema"
              >
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Novo relatório gerado</p>
                      <p className="text-gray-500 text-xs">Relatório bimestral da Escola Municipal Pedro II</p>
                      <p className="text-accent text-xs">Hoje, 09:45</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Novos usuários cadastrados</p>
                      <p className="text-gray-500 text-xs">12 alunos adicionados à plataforma</p>
                      <p className="text-accent text-xs">Ontem, 15:30</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                      <AlertCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Alerta de engajamento</p>
                      <p className="text-gray-500 text-xs">Queda de atividade em 2 turmas do 8º ano</p>
                      <p className="text-accent text-xs">12/05, 13:15</p>
                    </div>
                  </div>
                </div>
              </ManagerCard>
            </div>
          </TabsContent>
          
          {/* Tab de Relatórios */}
          <TabsContent value="reports">
            <ManagerCard 
              title="Relatórios"
              description="Gere relatórios detalhados sobre o desempenho dos alunos, escolas e missões."
              className="mb-4"
            >
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="manager-card p-3 flex flex-col items-center justify-center hover:bg-dark-light cursor-pointer transition-colors">
                  <FileBarChart2 size={24} className="text-accent mb-2" />
                  <span className="text-white text-sm font-medium">Desempenho por Turma</span>
                </div>
                
                <div className="manager-card p-3 flex flex-col items-center justify-center hover:bg-dark-light cursor-pointer transition-colors">
                  <Users size={24} className="text-accent mb-2" />
                  <span className="text-white text-sm font-medium">Engajamento de Alunos</span>
                </div>
                
                <div className="manager-card p-3 flex flex-col items-center justify-center hover:bg-dark-light cursor-pointer transition-colors">
                  <Book size={24} className="text-accent mb-2" />
                  <span className="text-white text-sm font-medium">Missões Completadas</span>
                </div>
                
                <div className="manager-card p-3 flex flex-col items-center justify-center hover:bg-dark-light cursor-pointer transition-colors">
                  <School size={24} className="text-accent mb-2" />
                  <span className="text-white text-sm font-medium">Desempenho por Escola</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-2">Filtros</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-white/70 text-xs block mb-1">Escola</label>
                        <select className="manager-select">
                          <option value="">Todas as escolas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-white/70 text-xs block mb-1">Turma</label>
                        <select className="manager-select">
                          <option value="">Todas as turmas</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-white/70 text-xs block mb-1">Período</label>
                        <select className="manager-select">
                          <option value="7">Últimos 7 dias</option>
                          <option value="30">Últimos 30 dias</option>
                          <option value="90">Últimos 90 dias</option>
                          <option value="year">Este ano</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-white/70 text-xs block mb-1">Componente</label>
                        <select className="manager-select">
                          <option value="">Todos os componentes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-white/70 text-xs block mb-1">Formato</label>
                        <select className="manager-select">
                          <option value="pdf">PDF</option>
                          <option value="xlsx">XLSX</option>
                          <option value="csv">CSV</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Ações</h4>
                  <div className="space-y-2">
                    <ManagerButton 
                      className="w-full flex justify-center items-center" 
                      icon={<FileBarChart2 className="h-4 w-4 mr-1.5" />}
                    >
                      Gerar Relatório
                    </ManagerButton>
                    
                    <ManagerButton 
                      className="w-full flex justify-center items-center" 
                      icon={<Clock className="h-4 w-4 mr-1.5" />}
                    >
                      Agendar Relatório
                    </ManagerButton>
                  </div>
                </div>
              </div>
            </ManagerCard>
            
            <ManagerCard
              title="Relatórios Recentes"
              description="Visualize ou baixe os relatórios gerados anteriormente"
            >
              <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                <div className="mb-3 text-primary/50">
                  <FileBarChart2 size={32} />
                </div>
                <p>Nenhum relatório gerado recentemente</p>
              </div>
            </ManagerCard>
          </TabsContent>
          
          {/* Tab de Configurações */}
          <TabsContent value="settings">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <ManagerCard
                title="Gerenciar Usuários"
                description="Adicionar, editar ou remover usuários do sistema"
              >
                <div className="space-y-2 mt-2">
                  <ManagerButton 
                    className="w-full flex justify-center items-center" 
                    icon={<User className="h-4 w-4 mr-1.5" />}
                  >
                    Gerenciar Usuários
                  </ManagerButton>
                </div>
              </ManagerCard>
              
              <ManagerCard
                title="Gerenciar Turmas"
                description="Criar e configurar turmas"
              >
                <div className="space-y-2 mt-2">
                  <ManagerButton 
                    className="w-full flex justify-center items-center" 
                    icon={<Users className="h-4 w-4 mr-1.5" />}
                  >
                    Gerenciar Turmas
                  </ManagerButton>
                </div>
              </ManagerCard>
              
              <ManagerCard
                title="Gerenciar Escolas"
                description="Administrar escolas vinculadas"
              >
                <div className="space-y-2 mt-2">
                  <ManagerButton 
                    className="w-full flex justify-center items-center" 
                    icon={<School className="h-4 w-4 mr-1.5" />}
                  >
                    Gerenciar Escolas
                  </ManagerButton>
                </div>
              </ManagerCard>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <ManagerCard
                title="Configurar Componentes"
                description="Gerenciar componentes curriculares"
              >
                <div className="space-y-2 mt-2">
                  <ManagerButton 
                    className="w-full flex justify-center items-center" 
                    icon={<Book className="h-4 w-4 mr-1.5" />}
                  >
                    Configurar Componentes
                  </ManagerButton>
                </div>
              </ManagerCard>
              
              <ManagerCard
                title="Trilhas de Aprendizagem"
                description="Configurar trilhas e jornadas"
              >
                <div className="space-y-2 mt-2">
                  <ManagerButton 
                    className="w-full flex justify-center items-center"
                  >
                    Acessar Trilhas
                  </ManagerButton>
                </div>
              </ManagerCard>
              
              <ManagerCard
                title="Missões e Desafios"
                description="Criar e gerenciar missões"
              >
                <div className="space-y-2 mt-2">
                  <ManagerButton 
                    className="w-full flex justify-center items-center"
                  >
                    Gerenciar Missões
                  </ManagerButton>
                </div>
              </ManagerCard>
            </div>
          </TabsContent>
          
          {/* Tab de Perfil */}
          <TabsContent value="profile">
            <ManagerCard
              title="Meu Perfil"
              description="Visualize e edite suas informações pessoais."
            >
              <ManagerProfile userId={user.id.toString()} />
            </ManagerCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}