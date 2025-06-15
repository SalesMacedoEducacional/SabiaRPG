import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  TotalEscolasCard, 
  TotalProfessoresCard, 
  TotalAlunosCard, 
  TotalTurmasCard 
} from "@/components/manager/ManagerDashboardCards";
import { EscolasVinculadasCard } from "@/components/manager/EscolasVinculadasCard";
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
  ChevronRight,
  Search,
  Library
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Importações dos componentes de abas
import ManagerSchoolRegistration from '../components/manager/ManagerSchoolRegistration';
import ManagerProfile from '../components/manager/ManagerProfile';
import ComponentesCurriculares from '../components/manager/ComponentsCurriculares';

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
    <div className="min-h-screen bg-[#312e26]">
      {/* Header */}
      <header className="bg-[#312e26] border-b border-accent shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-[#bf7918]">🦉</div>
              <div>
                <h1 className="text-xl font-bold text-white">SABIÁ RPG</h1>
                <p className="text-xs text-accent">GESTOR</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="pl-8 w-64 bg-[#4a4639] border-accent text-white placeholder:text-white/70"
              />
            </div>
            
            {/* Profile Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full bg-[#4a4639] hover:bg-accent/20">
                  <User className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-[#312e26] border-accent" align="end">
                <DropdownMenuLabel className="text-white">Perfil do Usuário</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-accent" />
                <div className="p-4">
                  <div className="space-y-2 text-sm text-white">
                    <div><strong>Nome:</strong> {user?.nome || user?.email}</div>
                    <div><strong>E-mail:</strong> {user?.email}</div>
                    <div><strong>Papel:</strong> {user?.role === 'manager' ? 'Gestor' : user?.role}</div>
                    <div><strong>ID:</strong> {user?.id}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-[#bf7918] hover:bg-[#a66717] text-white"
                      onClick={() => setActiveTab('profile')}
                    >
                      Editar Perfil
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-accent text-white hover:bg-accent/20"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} className="mr-1" />
                      Sair
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-0 py-0">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-[#4a4639] border-r border-accent min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4">GESTÃO</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-[#312e26] text-white border-l-4 border-[#bf7918]' 
                      : 'text-white/70 hover:bg-[#312e26] hover:text-white'
                  }`}
                >
                  <Home size={16} className="mr-3" />
                  Visão Geral
                </button>
                
                <button
                  onClick={() => navigate('/school-registration')}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-white/70 hover:bg-[#312e26] hover:text-white"
                >
                  <School size={16} className="mr-3" />
                  Escolas
                </button>
                
                <button
                  onClick={() => navigate('/turmas')}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-white/70 hover:bg-[#312e26] hover:text-white"
                >
                  <BookOpen size={16} className="mr-3" />
                  Turmas
                </button>
                
                <button
                  onClick={() => setActiveTab('components')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'components' 
                      ? 'bg-[#312e26] text-white border-l-4 border-[#bf7918]' 
                      : 'text-white/70 hover:bg-[#312e26] hover:text-white'
                  }`}
                >
                  <Library size={16} className="mr-3" />
                  Componentes
                </button>
                
                <button
                  onClick={() => navigate('/users')}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md transition-colors text-white/70 hover:bg-[#312e26] hover:text-white"
                >
                  <Users size={16} className="mr-3" />
                  Usuários
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'reports' 
                      ? 'bg-[#312e26] text-white border-l-4 border-[#bf7918]' 
                      : 'text-white/70 hover:bg-[#312e26] hover:text-white'
                  }`}
                >
                  <FileBarChart2 size={16} className="mr-3" />
                  Relatórios
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-[#312e26] text-white border-l-4 border-[#bf7918]' 
                      : 'text-white/70 hover:bg-[#312e26] hover:text-white'
                  }`}
                >
                  <Settings size={16} className="mr-3" />
                  Configurações
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="hidden">
                <TabsList className="grid grid-cols-4 gap-0 bg-[#4a4639] border-b border-accent">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="components">Componentes</TabsTrigger>
                  <TabsTrigger value="reports">Relatórios</TabsTrigger>
                  <TabsTrigger value="settings">Configurações</TabsTrigger>
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                </TabsList>
              </div>
          
          {/* Tab de Visão Geral */}
          <TabsContent value="overview" className="p-6">
            {/* Primeira linha: estatísticas básicas */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <EscolasVinculadasCard />
              <TotalProfessoresCard />
              <TotalAlunosCard />
              <TotalTurmasCard />
            </div>
            
            {/* Segunda linha: ações, alunos ativos, alertas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Ações Rápidas */}
              <div className="manager-card overflow-hidden">
                <div className="manager-card-header">
                  <h3 className="text-sm font-medium text-white">Ações Rápidas</h3>
                  <p className="text-xs text-white/70">
                    Acesso direto às principais tarefas administrativas
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    <button 
                      className="manager-action-button w-full"
                      onClick={() => navigate('/user-registration')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-white">Cadastrar Novo Usuário</span>
                    </button>
                    
                    <button
                      className="manager-action-button w-full"
                      onClick={() => navigate('/school-registration')}
                    >
                      <School className="h-4 w-4 mr-2" />
                      <span className="text-white">Cadastrar Nova Escola</span>
                    </button>
                    
                    <button
                      className="manager-action-button w-full"
                      onClick={() => navigate('/turmas')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="text-white">Gerenciar Turmas</span>
                    </button>
                    
                    <ComponentesCurriculares />
                  </div>
                </div>
              </div>
              
              {/* Alunos Ativos */}
              <div className="manager-card overflow-hidden">
                <div className="manager-card-header">
                  <h3 className="text-sm font-medium text-white">Alunos Ativos na Plataforma</h3>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white text-3xl font-bold">0</div>
                      <div className="text-accent text-xs">Últimos 7 dias</div>
                    </div>
                    <div>
                      <div className="text-white text-3xl font-bold">0</div>
                      <div className="text-accent text-xs">Últimos 30 dias</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Alerta de Evasão */}
              <div className="manager-card overflow-hidden">
                <div className="manager-card-header">
                  <h3 className="text-sm font-medium text-white">Alerta de Evasão Potencial</h3>
                  <p className="text-xs text-white/70">
                    Alunos com mais de 30 dias sem acesso
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-white text-4xl font-bold text-center my-4">0</div>
                  
                  <button className="manager-button w-full">
                    Ver Lista
                  </button>
                </div>
              </div>
            </div>
            
            {/* Escolas com maior engajamento e atividade recente */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Escolas com Maior Engajamento */}
              <div className="manager-card overflow-hidden">
                <div className="manager-card-header">
                  <h3 className="text-sm font-medium text-white">Escolas com Maior Engajamento</h3>
                  <p className="text-xs text-white/70">
                    Escolas com melhores taxas de participação
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-center h-40 text-white">
                    Nenhuma escola cadastrada
                  </div>
                </div>
              </div>
              
              {/* Atividade Recente */}
              <div className="manager-card overflow-hidden">
                <div className="manager-card-header">
                  <h3 className="text-sm font-medium text-white">Atividade Recente</h3>
                  <p className="text-xs text-white/70">
                    Últimas ações e eventos no sistema
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-[#4a4639] p-1.5 rounded-full mr-3 mt-0.5">
                        <FileText className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Novo relatório gerado</p>
                        <p className="text-white/70 text-xs">Relatório bimestral da Escola Municipal Pedro II</p>
                        <p className="text-accent text-xs">Hoje, 09:45</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-[#4a4639] p-1.5 rounded-full mr-3 mt-0.5">
                        <Users className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Novos usuários cadastrados</p>
                        <p className="text-white/70 text-xs">12 alunos adicionados à plataforma</p>
                        <p className="text-accent text-xs">Ontem, 15:30</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-[#4a4639] p-1.5 rounded-full mr-3 mt-0.5">
                        <AlertCircle className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Alerta de engajamento</p>
                        <p className="text-white/70 text-xs">Queda de atividade em 2 turmas do 8º ano</p>
                        <p className="text-accent text-xs">12/05, 13:15</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Relatórios */}
          <TabsContent value="reports">
            <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden mb-4">
              <div className="bg-[#4a4639] p-3 border-b border-[#D47C06]">
                <h3 className="text-lg font-medium text-white">Relatórios</h3>
                <p className="text-sm text-white/70">
                  Gere relatórios detalhados sobre o desempenho dos alunos, escolas e missões.
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#312e26] border border-[#D47C06] p-3 flex flex-col items-center justify-center hover:bg-[#4a4639] cursor-pointer transition-colors rounded-md">
                    <FileBarChart2 size={24} className="text-accent mb-2" />
                    <span className="text-white text-sm font-medium">Desempenho por Turma</span>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] p-3 flex flex-col items-center justify-center hover:bg-[#4a4639] cursor-pointer transition-colors rounded-md">
                    <Users size={24} className="text-accent mb-2" />
                    <span className="text-white text-sm font-medium">Engajamento de Alunos</span>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] p-3 flex flex-col items-center justify-center hover:bg-[#4a4639] cursor-pointer transition-colors rounded-md">
                    <Book size={24} className="text-accent mb-2" />
                    <span className="text-white text-sm font-medium">Missões Completadas</span>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] p-3 flex flex-col items-center justify-center hover:bg-[#4a4639] cursor-pointer transition-colors rounded-md">
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
                          <select className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm">
                            <option value="">Todas as escolas</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-white/70 text-xs block mb-1">Turma</label>
                          <select className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm">
                            <option value="">Todas as turmas</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-white/70 text-xs block mb-1">Período</label>
                          <select className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30">Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="year">Este ano</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-white/70 text-xs block mb-1">Componente</label>
                          <select className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm">
                            <option value="">Todos os componentes</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-white/70 text-xs block mb-1">Formato</label>
                          <select className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm">
                            <option value="pdf">PDF</option>
                            <option value="xlsx">XLSX</option>
                            <option value="csv">CSV</option>
                          </select>
                        </div>
                      </div>
                      
                      <Button className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors">
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-foreground text-sm font-medium mb-2">Métricas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="metric1" 
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                        />
                        <label htmlFor="metric1" className="text-xs">Pontuação média</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="metric2" 
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                        />
                        <label htmlFor="metric2" className="text-xs">Missões completadas</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="metric3" 
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                        />
                        <label htmlFor="metric3" className="text-xs">Tempo de atividade</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="metric4" 
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                        />
                        <label htmlFor="metric4" className="text-xs">Taxa de conclusão</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="metric5" 
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                        />
                        <label htmlFor="metric5" className="text-xs">Desistências</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Configurações */}
          <TabsContent value="settings">
            <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden mb-4">
              <div className="bg-[#4a4639] p-3 border-b border-[#D47C06]">
                <h3 className="text-lg font-medium text-white">Configurações</h3>
                <p className="text-sm text-white/70">
                  Gerencie configurações do sistema e preferências do usuário.
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden hover:border-amber-400 transition-colors">
                    <div className="p-3 border-b border-[#D47C06]">
                      <h4 className="text-sm font-medium text-white">Gerenciar Usuários</h4>
                      <p className="text-xs text-white/70">
                        Professores, alunos e outros gestores
                      </p>
                    </div>
                    <div className="p-3">
                      <button 
                        className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors w-full"
                        onClick={() => navigate('/user-registration')}
                      >
                        Acessar
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden hover:border-amber-400 transition-colors">
                    <div className="p-3 border-b border-[#D47C06]">
                      <h4 className="text-sm font-medium text-white">Gerenciar Escolas</h4>
                      <p className="text-xs text-white/70">
                        Adicionar, editar e gerenciar escolas
                      </p>
                    </div>
                    <div className="p-3">
                      <button 
                        className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors w-full"
                        onClick={() => navigate('/school-registration')}
                      >
                        Acessar
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden hover:border-amber-400 transition-colors">
                    <div className="p-3 border-b border-[#D47C06]">
                      <h4 className="text-sm font-medium text-white">Gerenciar Turmas</h4>
                      <p className="text-xs text-white/70">
                        Adicionar, editar e gerenciar turmas
                      </p>
                    </div>
                    <div className="p-3">
                      <button 
                        className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors w-full"
                        onClick={() => navigate('/turmas')}
                      >
                        Acessar
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden hover:border-amber-400 transition-colors">
                    <div className="p-3 border-b border-[#D47C06]">
                      <h4 className="text-sm font-medium text-white">Componentes Curriculares</h4>
                      <p className="text-xs text-white/70">
                        Gerenciar disciplinas e componentes
                      </p>
                    </div>
                    <div className="p-3">
                      <button className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors w-full">
                        Acessar
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden hover:border-amber-400 transition-colors">
                    <div className="p-3 border-b border-[#D47C06]">
                      <h4 className="text-sm font-medium text-white">Trilhas de Aprendizagem</h4>
                      <p className="text-xs text-white/70">
                        Configurar trilhas e jornadas
                      </p>
                    </div>
                    <div className="p-3">
                      <button className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors w-full">
                        Acessar
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden hover:border-amber-400 transition-colors">
                    <div className="p-3 border-b border-[#D47C06]">
                      <h4 className="text-sm font-medium text-white">Missões e Desafios</h4>
                      <p className="text-xs text-white/70">
                        Criar e gerenciar missões
                      </p>
                    </div>
                    <div className="p-3">
                      <button className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors w-full">
                        Acessar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Perfil */}
          <TabsContent value="profile">
            <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden mb-4">
              <div className="bg-[#4a4639] p-3 border-b border-[#D47C06]">
                <h3 className="text-lg font-medium text-white">Meu Perfil</h3>
                <p className="text-sm text-white/70">
                  Visualize e edite suas informações pessoais.
                </p>
              </div>
              <div className="p-4">
                <ManagerProfile userId={user.id.toString()} />
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Componentes */}
          <TabsContent value="components" className="p-6">
            <div className="bg-[#312e26] border border-[#D47C06] rounded-md overflow-hidden mb-4">
              <div className="bg-[#4a4639] p-3 border-b border-[#D47C06]">
                <h3 className="text-lg font-medium text-white">Gerenciar Componentes Curriculares</h3>
                <p className="text-sm text-white/70">
                  Gerencie os componentes curriculares de todas as turmas
                </p>
              </div>
              <div className="p-4">
                <ComponentesCurriculares />
              </div>
            </div>
          </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}