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
      navigate("/auth");
    }
  }, [user, navigate]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#231f20]">
      {/* Header */}
      <header className="bg-[#231f20] shadow py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">DASHBOARD DO GESTOR</h1>
            <p className="text-gray-300 text-sm">
              Bem-vindo, gestor!
            </p>
          </div>
          <Button 
            variant="destructive"
            size="sm"
            className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-0 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 gap-0.5 mb-2 bg-[#231f20]">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-300 hover:text-white bg-[#623b16] py-2"
            >
              <span className="flex items-center">
                <Home size={14} className="mr-1" />
                Visão Geral
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center justify-center data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-300 hover:text-white bg-[#623b16] py-2"
            >
              <span className="flex items-center">
                <FileBarChart2 size={14} className="mr-1" />
                Relatórios
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center justify-center data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-300 hover:text-white bg-[#623b16] py-2"
            >
              <span className="flex items-center">
                <Settings size={14} className="mr-1" />
                Configurações
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center data-[state=active]:bg-[#a85f16] data-[state=active]:text-white text-gray-300 hover:text-white bg-[#623b16] py-2"
            >
              <span className="flex items-center">
                <User size={14} className="mr-1" />
                Meu Perfil
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Visão Geral */}
          <TabsContent value="overview">
            {/* Primeira linha: estatísticas básicas */}
            <div className="grid grid-cols-4 gap-1 mb-1">
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-1">Total de Escolas Vinculadas</div>
                <div className="text-white text-4xl font-bold">0</div>
                <div className="text-gray-400 text-xs">0 ativas</div>
              </div>
              
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-1">Total de Professores</div>
                <div className="text-white text-4xl font-bold">0</div>
                <div className="text-gray-400 text-xs">Em todas as escolas</div>
              </div>
              
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-1">Total de Alunos</div>
                <div className="text-white text-4xl font-bold">0</div>
                <div className="text-gray-400 text-xs">Em todas as escolas</div>
              </div>
              
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-1">Turmas Ativas</div>
                <div className="text-white text-4xl font-bold">0</div>
                <div className="text-gray-400 text-xs">Distribuídas em todas as escolas</div>
              </div>
            </div>
            
            {/* Segunda linha: ações, alunos ativos, alertas */}
            <div className="grid grid-cols-3 gap-1 mb-1">
              {/* Ações Rápidas */}
              <div className="bg-[#3e2a18] p-4">
                <div className="text-white text-sm mb-1">Ações Rápidas</div>
                <div className="text-gray-400 text-xs mb-4">Acesso direto às principais tarefas administrativas</div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    className="bg-transparent text-white hover:bg-[#4b321c] transition-colors p-2 pl-3 flex items-center justify-start space-x-2 text-sm"
                    onClick={() => navigate('/user-registration')}
                  >
                    <User className="h-5 w-5 text-white" />
                    <span>Cadastrar Novo Usuário</span>
                  </button>
                  
                  <button
                    className="bg-transparent text-white hover:bg-[#4b321c] transition-colors p-2 pl-3 flex items-center justify-start space-x-2 text-sm"
                    onClick={() => navigate('/school-registration')}
                  >
                    <School className="h-5 w-5 text-white" />
                    <span>Cadastrar Nova Escola</span>
                  </button>
                  
                  <button
                    className="bg-transparent text-white hover:bg-[#4b321c] transition-colors p-2 pl-3 flex items-center justify-start space-x-2 text-sm"
                    onClick={() => navigate('/class-registration')}
                  >
                    <BookOpen className="h-5 w-5 text-white" />
                    <span>Gerenciar Turmas</span>
                  </button>
                </div>
              </div>
              
              {/* Alunos Ativos */}
              <div className="bg-[#3e2a18] p-4">
                <div className="text-white text-sm mb-3">Alunos Ativos na Plataforma</div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white text-3xl font-bold">0</div>
                    <div className="text-gray-400 text-xs">Últimos 7 dias</div>
                  </div>
                  <div>
                    <div className="text-white text-3xl font-bold">0</div>
                    <div className="text-gray-400 text-xs">Últimos 30 dias</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-white text-sm font-medium mb-2">Nível de Engajamento Geral</div>
                  <div className="bg-[#231f20] rounded-full h-2 w-full">
                    <div className="bg-[#a85f16] h-2 rounded-full w-[0%]"></div>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Baseado no tempo de uso e atividades completadas</div>
                </div>
              </div>
              
              {/* Alerta de Evasão */}
              <div className="bg-[#3e2a18] p-4">
                <div className="text-white text-sm mb-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                  Alerta de Evasão Potencial
                </div>
                <div className="text-gray-400 text-xs mb-3">Alunos com mais de 10 dias sem acesso</div>
                
                <div className="text-white text-4xl font-bold text-center mt-6 mb-8">0</div>
                
                <button className="w-full bg-[#231f20] hover:bg-[#323232] text-white text-sm p-2 transition-colors">
                  Ver Lista
                </button>
              </div>
            </div>
            
            {/* Terceira linha: Missões */}
            <div className="grid grid-cols-3 gap-1 mb-1">
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-2">Missões</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold">0</div>
                    <div className="text-gray-400 text-xs">Em andamento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold">0</div>
                    <div className="text-gray-400 text-xs">Concluídas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold">0</div>
                    <div className="text-gray-400 text-xs">Pendentes</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quarta linha: Escolas com maior engajamento e atividade recente */}
            <div className="grid grid-cols-2 gap-1 mb-1">
              {/* Escolas com Maior Engajamento */}
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-1">Escolas com Maior Engajamento</div>
                <div className="text-gray-400 text-xs mb-4">Escolas com melhores taxas de participação</div>
                
                <div className="flex items-center justify-center h-32 text-white">
                  Nenhuma escola cadastrada
                </div>
              </div>
              
              {/* Atividade Recente */}
              <div className="bg-[#3e2a18] p-3">
                <div className="text-white text-sm mb-1">Atividade Recente</div>
                <div className="text-gray-400 text-xs mb-3">Últimas ações e eventos no sistema</div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#231f20] p-1.5 rounded-full">
                      <FileText className="h-4 w-4 text-[#a85f16]" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Novo relatório gerado</p>
                      <p className="text-gray-400 text-xs">Relatório bimestral da Escola Municipal Pedro II</p>
                      <p className="text-gray-500 text-xs">Hoje, 09:45</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#231f20] p-1.5 rounded-full">
                      <Users className="h-4 w-4 text-[#a85f16]" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Novos usuários cadastrados</p>
                      <p className="text-gray-400 text-xs">12 alunos adicionados à plataforma</p>
                      <p className="text-gray-500 text-xs">Ontem, 15:30</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#231f20] p-1.5 rounded-full">
                      <AlertCircle className="h-4 w-4 text-[#a85f16]" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Alerta de engajamento</p>
                      <p className="text-gray-400 text-xs">Queda de atividade em 2 turmas do 8º ano</p>
                      <p className="text-gray-500 text-xs">12/05, 13:15</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notificação de erro */}
            <div className="bg-red-900/60 border border-red-700 text-white p-2 mt-1">
              <p className="text-sm font-medium mb-1">Erro</p>
              <p className="text-xs">Não foi possível carregar a lista de escolas.</p>
            </div>
          </TabsContent>
          
          {/* Tab de Relatórios */}
          <TabsContent value="reports">
            <div className="bg-[#3e2a18] p-4">
              <div className="mb-4">
                <h3 className="text-white text-lg font-medium mb-2">Relatórios</h3>
                <p className="text-gray-400 text-sm">
                  Gere relatórios detalhados sobre o desempenho dos alunos, escolas e missões.
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#231f20] p-3 flex flex-col items-center justify-center hover:bg-[#2a2526] cursor-pointer">
                  <FileBarChart2 size={24} className="text-[#a85f16] mb-2" />
                  <span className="text-white text-sm font-medium">Desempenho por Turma</span>
                </div>
                
                <div className="bg-[#231f20] p-3 flex flex-col items-center justify-center hover:bg-[#2a2526] cursor-pointer">
                  <Users size={24} className="text-[#a85f16] mb-2" />
                  <span className="text-white text-sm font-medium">Engajamento de Alunos</span>
                </div>
                
                <div className="bg-[#231f20] p-3 flex flex-col items-center justify-center hover:bg-[#2a2526] cursor-pointer">
                  <Book size={24} className="text-[#a85f16] mb-2" />
                  <span className="text-white text-sm font-medium">Missões Completadas</span>
                </div>
                
                <div className="bg-[#231f20] p-3 flex flex-col items-center justify-center hover:bg-[#2a2526] cursor-pointer">
                  <School size={24} className="text-[#a85f16] mb-2" />
                  <span className="text-white text-sm font-medium">Desempenho por Escola</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-2">Filtros</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Escola</label>
                        <select className="w-full bg-[#231f20] text-white text-sm p-2 border border-[#4b321c]">
                          <option value="">Todas as escolas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Turma</label>
                        <select className="w-full bg-[#231f20] text-white text-sm p-2 border border-[#4b321c]">
                          <option value="">Todas as turmas</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Componente</label>
                        <select className="w-full bg-[#231f20] text-white text-sm p-2 border border-[#4b321c]">
                          <option value="">Todos os componentes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Período</label>
                        <select className="w-full bg-[#231f20] text-white text-sm p-2 border border-[#4b321c]">
                          <option value="ultimo_mes">Último mês</option>
                          <option value="ultimo_bimestre">Último bimestre</option>
                          <option value="ultimo_semestre">Último semestre</option>
                          <option value="ano_letivo">Ano letivo atual</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="bg-[#a85f16] hover:bg-[#8a4f12] text-white text-sm px-4 py-2">
                        Gerar Relatório
                      </button>
                      
                      <select className="bg-[#231f20] text-white text-sm p-2 border border-[#4b321c]">
                        <option value="pdf">PDF</option>
                        <option value="xlsx">XLSX</option>
                        <option value="ods">ODS</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-[#231f20] p-4 flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText size={48} className="text-gray-500 mx-auto mb-2" />
                      <p className="text-white text-sm">Selecione os filtros e clique em "Gerar Relatório"</p>
                      <p className="text-gray-400 text-xs mt-1">A pré-visualização aparecerá aqui</p>
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
            <div className="bg-[#3e2a18] p-4">
              <div className="mb-4">
                <h3 className="text-white text-lg font-medium mb-2">Configurações</h3>
                <p className="text-gray-400 text-sm">
                  Gerencie usuários, turmas, componentes, trilhas e missões
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <h4 className="text-white text-sm font-medium mb-3">Opções de Gerenciamento</h4>
                  
                  <div className="space-y-2">
                    <button 
                      className="w-full bg-[#231f20] text-white text-left p-3 hover:bg-[#2a2526] flex items-center justify-between"
                      onClick={() => navigate('/user-registration')}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-[#a85f16]" />
                        <span>Gerenciar Usuários</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#231f20] text-white text-left p-3 hover:bg-[#2a2526] flex items-center justify-between"
                      onClick={() => navigate('/class-registration')}
                    >
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-[#a85f16]" />
                        <span>Gerenciar Turmas</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#231f20] text-white text-left p-3 hover:bg-[#2a2526] flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Book className="h-5 w-5 mr-2 text-[#a85f16]" />
                        <span>Gerenciar Componentes</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#231f20] text-white text-left p-3 hover:bg-[#2a2526] flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-[#a85f16]" />
                        <span>Gerenciar Trilhas</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button 
                      className="w-full bg-[#231f20] text-white text-left p-3 hover:bg-[#2a2526] flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-[#a85f16]" />
                        <span>Gerenciar Missões</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 bg-[#231f20] p-4">
                  <h4 className="text-white text-sm font-medium mb-3">Configurações do Sistema</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Escola Principal</label>
                      <select className="w-full bg-[#2a2526] text-white text-sm p-2 border border-[#4b321c]">
                        <option value="">Selecione a escola principal</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Escola que será exibida por padrão nos relatórios</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Período Letivo</label>
                      <select className="w-full bg-[#2a2526] text-white text-sm p-2 border border-[#4b321c]">
                        <option value="2025_1">1º Semestre 2025</option>
                        <option value="2025_2">2º Semestre 2025</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Período letivo atual para cálculos de relatórios</p>
                    </div>
                    
                    <div className="pt-4 border-t border-[#4b321c]">
                      <h5 className="text-white text-sm font-medium mb-3">Configurações de Notificações</h5>
                      
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-300 text-sm">Receber alertas de evasão</label>
                        <div className="w-10 h-5 bg-[#4b321c] rounded-full relative">
                          <div className="w-4 h-4 absolute bg-white rounded-full left-0.5 top-0.5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-300 text-sm">Notificações de novos relatórios</label>
                        <div className="w-10 h-5 bg-[#a85f16] rounded-full relative">
                          <div className="w-4 h-4 absolute bg-white rounded-full right-0.5 top-0.5"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300 text-sm">Resumo semanal via e-mail</label>
                        <div className="w-10 h-5 bg-[#a85f16] rounded-full relative">
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
            <div className="bg-[#3e2a18] p-4">
              <ManagerProfile userId={user?.id ? String(user.id) : ''} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}