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

/**
 * Dashboard do Gestor - Versão com tema escuro medieval
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
    <div className="min-h-screen gestor-bg">
      {/* Header */}
      <header className="gestor-bg border-b border-[#D47C06] shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center py-3">
          <div>
            <h1 className="text-2xl font-bold gestor-text">DASHBOARD DO GESTOR</h1>
            <p className="gestor-text-aux text-sm">
              Bem-vindo, gestor!
            </p>
          </div>
          <Button 
            variant="default"
            size="sm"
            className="flex items-center gap-1 bg-[#F08B13] text-white hover:bg-[#D47C06] border border-[#D47C06]"
            onClick={handleLogout}
          >
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-0 py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 gap-0 bg-[#100B09]">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#F08B13] text-[#C2C2C2] hover:text-white bg-[#1A110B] py-2 rounded-none border-r border-[#100B09]"
            >
              <span className="flex items-center">
                <Home size={14} className="mr-1.5" />
                Visão Geral
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center justify-center data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#F08B13] text-[#C2C2C2] hover:text-white bg-[#1A110B] py-2 rounded-none border-r border-[#100B09]"
            >
              <span className="flex items-center">
                <FileBarChart2 size={14} className="mr-1.5" />
                Relatórios
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center justify-center data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#F08B13] text-[#C2C2C2] hover:text-white bg-[#1A110B] py-2 rounded-none border-r border-[#100B09]"
            >
              <span className="flex items-center">
                <Settings size={14} className="mr-1.5" />
                Configurações
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#F08B13] text-[#C2C2C2] hover:text-white bg-[#1A110B] py-2 rounded-none"
            >
              <span className="flex items-center">
                <User size={14} className="mr-1.5" />
                Meu Perfil
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Visão Geral */}
          <TabsContent value="overview">
            {/* Primeira linha: estatísticas básicas */}
            <div className="grid grid-cols-4 gap-1 mb-1">
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Total de Escolas Vinculadas</div>
                <div className="text-white text-4xl font-bold mt-1">0</div>
                <div className="text-[#C2C2C2] text-xs">0 ativas</div>
              </div>
              
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Total de Professores</div>
                <div className="text-white text-4xl font-bold mt-1">0</div>
                <div className="text-[#C2C2C2] text-xs">Em todas as escolas</div>
              </div>
              
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Total de Alunos</div>
                <div className="text-white text-4xl font-bold mt-1">0</div>
                <div className="text-[#C2C2C2] text-xs">Em todas as escolas</div>
              </div>
              
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Turmas Ativas</div>
                <div className="text-white text-4xl font-bold mt-1">0</div>
                <div className="text-[#C2C2C2] text-xs">Distribuídas em todas as escolas</div>
              </div>
            </div>
            
            {/* Segunda linha: ações, alunos ativos, alertas */}
            <div className="grid grid-cols-3 gap-1 mb-1">
              {/* Ações Rápidas */}
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Ações Rápidas</div>
                <div className="text-[#C2C2C2] text-xs mb-3">Acesso direto às principais tarefas administrativas</div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <button 
                    className="bg-transparent text-white hover:bg-[#0D0D0D] transition-colors p-2 flex items-center justify-start space-x-2 text-sm"
                    onClick={() => navigate('/user-registration')}
                  >
                    <User className="h-4 w-4 text-[#F08B13] mr-2" />
                    <span>Cadastrar Novo Usuário</span>
                  </button>
                  
                  <button
                    className="bg-transparent text-white hover:bg-[#0D0D0D] transition-colors p-2 flex items-center justify-start space-x-2 text-sm"
                    onClick={() => navigate('/school-registration')}
                  >
                    <School className="h-4 w-4 text-[#F08B13] mr-2" />
                    <span>Cadastrar Nova Escola</span>
                  </button>
                  
                  <button
                    className="bg-transparent text-white hover:bg-[#0D0D0D] transition-colors p-2 flex items-center justify-start space-x-2 text-sm"
                    onClick={() => navigate('/class-registration')}
                  >
                    <BookOpen className="h-4 w-4 text-[#F08B13] mr-2" />
                    <span>Gerenciar Turmas</span>
                  </button>
                </div>
              </div>
              
              {/* Alunos Ativos */}
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Alunos Ativos na Plataforma</div>
                
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <div className="text-white text-3xl font-bold">0</div>
                    <div className="text-[#C2C2C2] text-xs">Últimos 7 dias</div>
                  </div>
                  <div>
                    <div className="text-white text-3xl font-bold">0</div>
                    <div className="text-[#C2C2C2] text-xs">Últimos 30 dias</div>
                  </div>
                </div>
              </div>
              
              {/* Alerta de Evasão */}
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm mb-1">
                  Alerta de Evasão Potencial
                </div>
                <div className="text-[#C2C2C2] text-xs">Alunos com mais de 30 dias sem acesso</div>
                
                <div className="text-white text-4xl font-bold text-center my-5">0</div>
                
                <button className="w-full bg-[#0D0D0D] hover:bg-[#272727] text-white text-sm py-1.5 transition-colors">
                  Ver Lista
                </button>
              </div>
            </div>
            
            {/* Escolas com maior engajamento e atividade recente */}
            <div className="grid grid-cols-2 gap-1 mb-1">
              {/* Escolas com Maior Engajamento */}
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Escolas com Maior Engajamento</div>
                <div className="text-[#C2C2C2] text-xs">Escolas com melhores taxas de participação</div>
                
                <div className="flex items-center justify-center h-40 text-white">
                  Nenhuma escola cadastrada
                </div>
              </div>
              
              {/* Atividade Recente */}
              <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
                <div className="text-white text-sm">Atividade Recente</div>
                <div className="text-[#C2C2C2] text-xs">Últimas ações e eventos no sistema</div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-start">
                    <div className="bg-[#0D0D0D] p-1.5 rounded-full mr-3 mt-0.5">
                      <FileText className="h-4 w-4 text-[#F08B13]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Novo relatório gerado</p>
                      <p className="text-[#C2C2C2] text-xs">Relatório bimestral da Escola Municipal Pedro II</p>
                      <p className="text-[#C2C2C2]/70 text-xs">Hoje, 09:45</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#0D0D0D] p-1.5 rounded-full mr-3 mt-0.5">
                      <Users className="h-4 w-4 text-[#F08B13]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Novos usuários cadastrados</p>
                      <p className="text-[#C2C2C2] text-xs">12 alunos adicionados à plataforma</p>
                      <p className="text-[#C2C2C2]/70 text-xs">Ontem, 15:30</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#0D0D0D] p-1.5 rounded-full mr-3 mt-0.5">
                      <AlertCircle className="h-4 w-4 text-[#F08B13]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Alerta de engajamento</p>
                      <p className="text-[#C2C2C2] text-xs">Queda de atividade em 2 turmas do 8º ano</p>
                      <p className="text-[#C2C2C2]/70 text-xs">12/05, 13:15</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Relatórios */}
          <TabsContent value="reports">
            <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
              <div className="mb-4">
                <h3 className="text-white text-lg font-medium mb-2">Relatórios</h3>
                <p className="text-[#C2C2C2] text-sm">
                  Gere relatórios detalhados sobre o desempenho dos alunos, escolas e missões.
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0D0D0D] p-3 flex flex-col items-center justify-center hover:bg-[#191919] cursor-pointer">
                  <FileBarChart2 size={24} className="text-[#F08B13] mb-2" />
                  <span className="text-white text-sm font-medium">Desempenho por Turma</span>
                </div>
                
                <div className="bg-[#0D0D0D] p-3 flex flex-col items-center justify-center hover:bg-[#191919] cursor-pointer">
                  <Users size={24} className="text-[#F08B13] mb-2" />
                  <span className="text-white text-sm font-medium">Engajamento de Alunos</span>
                </div>
                
                <div className="bg-[#0D0D0D] p-3 flex flex-col items-center justify-center hover:bg-[#191919] cursor-pointer">
                  <Book size={24} className="text-[#F08B13] mb-2" />
                  <span className="text-white text-sm font-medium">Missões Completadas</span>
                </div>
                
                <div className="bg-[#0D0D0D] p-3 flex flex-col items-center justify-center hover:bg-[#191919] cursor-pointer">
                  <School size={24} className="text-[#F08B13] mb-2" />
                  <span className="text-white text-sm font-medium">Desempenho por Escola</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-2">Filtros</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[#C2C2C2] text-xs block mb-1">Escola</label>
                        <select className="w-full bg-[#0D0D0D] text-white text-sm p-2 border border-[#D47C06]">
                          <option value="">Todas as escolas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[#C2C2C2] text-xs block mb-1">Turma</label>
                        <select className="w-full bg-[#0D0D0D] text-white text-sm p-2 border border-[#D47C06]">
                          <option value="">Todas as turmas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[#C2C2C2] text-xs block mb-1">Componente</label>
                        <select className="w-full bg-[#0D0D0D] text-white text-sm p-2 border border-[#D47C06]">
                          <option value="">Todos os componentes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[#C2C2C2] text-xs block mb-1">Período</label>
                        <select className="w-full bg-[#0D0D0D] text-white text-sm p-2 border border-[#D47C06]">
                          <option value="ultimo_mes">Último mês</option>
                          <option value="ultimo_bimestre">Último bimestre</option>
                          <option value="ultimo_semestre">Último semestre</option>
                          <option value="ano_letivo">Ano letivo atual</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="bg-[#F08B13] hover:bg-[#D47C06] text-white text-sm px-4 py-2">
                        Gerar Relatório
                      </button>
                      
                      <select className="bg-[#0D0D0D] text-white text-sm p-2 border border-[#D47C06]">
                        <option value="pdf">PDF</option>
                        <option value="xlsx">XLSX</option>
                        <option value="ods">ODS</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-[#0D0D0D] p-4 flex items-center justify-center h-64 border border-[#D47C06]">
                    <div className="text-center">
                      <FileText size={48} className="text-[#C2C2C2] mx-auto mb-2" />
                      <p className="text-white text-sm">Selecione os filtros e clique em "Gerar Relatório"</p>
                      <p className="text-[#C2C2C2] text-xs mt-1">A pré-visualização aparecerá aqui</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white text-sm font-medium mb-2">Relatórios Recentes</h4>
                  
                  <div className="bg-[#231f20] p-3 mb-2 border-l-2 border-[#a85f16]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white text-sm">Desempenho 1º Bimestre</span>
                      <span className="text-xs text-gray-400">PDF</span>
                    </div>
                    <p className="text-xs text-gray-400">8º Ano A - E.M. Augusto dos Anjos</p>
                    <p className="text-xs text-gray-500">Gerado em: 01/04/2025</p>
                    <button className="text-[#a85f16] text-xs mt-1 hover:underline">Fazer download</button>
                  </div>
                  
                  <div className="bg-[#231f20] p-3 mb-2 border-l-2 border-[#a85f16]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white text-sm">Missões Concluídas</span>
                      <span className="text-xs text-gray-400">XLSX</span>
                    </div>
                    <p className="text-xs text-gray-400">Todas as turmas - CEEP</p>
                    <p className="text-xs text-gray-500">Gerado em: 15/03/2025</p>
                    <button className="text-[#a85f16] text-xs mt-1 hover:underline">Fazer download</button>
                  </div>
                  
                  <div className="bg-[#231f20] p-3 border-l-2 border-[#a85f16]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white text-sm">Engajamento Anual</span>
                      <span className="text-xs text-gray-400">PDF</span>
                    </div>
                    <p className="text-xs text-gray-400">Todas as escolas</p>
                    <p className="text-xs text-gray-500">Gerado em: 10/02/2025</p>
                    <button className="text-[#a85f16] text-xs mt-1 hover:underline">Fazer download</button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Configurações */}
          <TabsContent value="settings">
            <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
              <div className="mb-4">
                <h3 className="text-white text-lg font-medium mb-2">Configurações</h3>
                <p className="text-[#C2C2C2] text-sm">
                  Gerencie usuários, turmas, componentes, trilhas e missões
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <h4 className="text-white text-sm font-medium mb-3">Opções de Gerenciamento</h4>
                  
                  <div className="space-y-2">
                    <button 
                      className="w-full bg-[#0D0D0D] text-white text-left p-3 hover:bg-[#191919] flex items-center justify-between"
                      onClick={() => navigate('/user-registration')}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-[#F08B13]" />
                        <span>Gerenciar Usuários</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#0D0D0D] text-white text-left p-3 hover:bg-[#191919] flex items-center justify-between"
                      onClick={() => navigate('/class-registration')}
                    >
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-[#F08B13]" />
                        <span>Gerenciar Turmas</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#0D0D0D] text-white text-left p-3 hover:bg-[#191919] flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Book className="h-5 w-5 mr-2 text-[#F08B13]" />
                        <span>Gerenciar Componentes</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#0D0D0D] text-white text-left p-3 hover:bg-[#191919] flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-[#F08B13]" />
                        <span>Gerenciar Trilhas</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#0D0D0D] text-white text-left p-3 hover:bg-[#191919] flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-[#F08B13]" />
                        <span>Gerenciar Missões</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 bg-[#0D0D0D] p-4 border border-[#D47C06]">
                  <h4 className="text-white text-sm font-medium mb-3">Configurações do Sistema</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#C2C2C2] text-xs block mb-1">Escola Principal</label>
                      <select className="w-full bg-[#1A110B] text-white text-sm p-2 border border-[#D47C06]">
                        <option value="">Selecione a escola principal</option>
                      </select>
                      <p className="text-xs text-[#C2C2C2]/70 mt-1">Escola que será exibida por padrão nos relatórios</p>
                    </div>
                    
                    <div>
                      <label className="text-[#C2C2C2] text-xs block mb-1">Período Letivo</label>
                      <select className="w-full bg-[#1A110B] text-white text-sm p-2 border border-[#D47C06]">
                        <option value="2025_1">1º Semestre 2025</option>
                        <option value="2025_2">2º Semestre 2025</option>
                      </select>
                      <p className="text-xs text-[#C2C2C2]/70 mt-1">Período letivo atual para cálculos de relatórios</p>
                    </div>
                    
                    <div className="pt-4 border-t border-[#D47C06]">
                      <h5 className="text-white text-sm font-medium mb-3">Configurações de Notificações</h5>
                      
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[#C2C2C2] text-sm">Receber alertas de evasão</label>
                        <div className="w-10 h-5 bg-[#1A110B] rounded-full relative border border-[#D47C06]">
                          <div className="w-4 h-4 absolute bg-white rounded-full left-0.5 top-0.5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[#C2C2C2] text-sm">Notificações de novos relatórios</label>
                        <div className="w-10 h-5 bg-[#F08B13] rounded-full relative border border-[#D47C06]">
                          <div className="w-4 h-4 absolute bg-white rounded-full right-0.5 top-0.5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-[#C2C2C2] text-sm">Resumo semanal via e-mail</label>
                        <div className="w-10 h-5 bg-[#F08B13] rounded-full relative border border-[#D47C06]">
                          <div className="w-4 h-4 absolute bg-white rounded-full right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Perfil */}
          <TabsContent value="profile">
            <div className="bg-[#1A110B] p-4 border border-[#D47C06]">
              <ManagerProfile userId={user?.id ? String(user.id) : ''} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}