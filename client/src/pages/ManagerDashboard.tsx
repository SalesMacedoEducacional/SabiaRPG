import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  School, 
  Users, 
  BookOpen, 
  FileBarChart2, 
  Settings, 
  User, 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut,
  Library,
  GraduationCap,
  PlusCircle,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Clock,
  MapPin,
  Book
} from 'lucide-react';
import ComponentesCurriculares from '@/components/manager/ComponentsCurriculares';
import ManagerProfile from '@/components/manager/ManagerProfile';

/**
 * Dashboard do Gestor
 * Este componente implementa o dashboard baseado na imagem de referência
 */
export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#312e26]">
      {/* Header */}
      <header className="bg-[#312e26] border-b border-accent shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center py-3">
          {/* Logo e título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#bf7918] rounded-full flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SABI RPG</h1>
              <p className="text-sm text-white/70">Painel do Gestor</p>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar escolas, turmas, usuários..."
                className="w-full bg-[#4a4639] text-white placeholder-white/50 pl-10 pr-4 py-2 rounded-md border border-[#D47C06] focus:border-[#bf7918] focus:outline-none"
              />
            </div>
          </div>

          {/* Área do usuário */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-white/70 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-[#bf7918] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{user.email}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showProfilePopup && (
                <div className="absolute right-0 mt-2 w-48 bg-[#4a4639] border border-[#D47C06] rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-[#D47C06]">
                    <p className="text-white text-sm font-medium">{user.email}</p>
                    <p className="text-white/70 text-xs">{user.perfil}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-full px-3 py-2 text-left text-white/70 hover:text-white hover:bg-[#312e26] transition-colors text-sm"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full px-3 py-2 text-left text-white/70 hover:text-white hover:bg-[#312e26] transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Configurações
                    </button>
                    <div className="border-t border-[#D47C06] my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-[#312e26] transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Total de Escolas</p>
                        <p className="text-2xl font-bold text-white">12</p>
                      </div>
                      <School className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Total de Turmas</p>
                        <p className="text-2xl font-bold text-white">48</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Total de Alunos</p>
                        <p className="text-2xl font-bold text-white">1,247</p>
                      </div>
                      <GraduationCap className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Total de Professores</p>
                        <p className="text-2xl font-bold text-white">87</p>
                      </div>
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                </div>

                {/* Segunda linha: gráficos e ações rápidas */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Gráfico de engajamento */}
                  <div className="col-span-2 bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <h3 className="text-lg font-medium text-white mb-4">Engajamento dos Alunos</h3>
                    <div className="h-64 flex items-center justify-center text-white/50">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                        <p>Gráfico de engajamento será implementado</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ações rápidas */}
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <h3 className="text-lg font-medium text-white mb-4">Ações Rápidas</h3>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate('/school-registration')}
                        className="w-full bg-[#4a4639] border border-[#D47C06] text-white hover:bg-[#57533f] hover:border-amber-400 justify-start"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nova Escola
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/turmas')}
                        className="w-full bg-[#4a4639] border border-[#D47C06] text-white hover:bg-[#57533f] hover:border-amber-400 justify-start"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Nova Turma
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/users')}
                        className="w-full bg-[#4a4639] border border-[#D47C06] text-white hover:bg-[#57533f] hover:border-amber-400 justify-start"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Novo Usuário
                      </Button>
                      
                      <Button 
                        onClick={() => setActiveTab('reports')}
                        className="w-full bg-[#4a4639] border border-[#D47C06] text-white hover:bg-[#57533f] hover:border-amber-400 justify-start"
                      >
                        <FileBarChart2 className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Terceira linha: atividades recentes e notificações */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Atividades recentes */}
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <h3 className="text-lg font-medium text-white mb-4">Atividades Recentes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-[#4a4639] rounded-md">
                        <School className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-white text-sm">Nova escola cadastrada</p>
                          <p className="text-white/50 text-xs">Há 2 horas</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-[#4a4639] rounded-md">
                        <Users className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-white text-sm">15 novos alunos matriculados</p>
                          <p className="text-white/50 text-xs">Há 4 horas</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-[#4a4639] rounded-md">
                        <BookOpen className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-white text-sm">Nova turma criada</p>
                          <p className="text-white/50 text-xs">Ontem</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alertas e notificações */}
                  <div className="bg-[#312e26] border border-[#D47C06] p-4 rounded-md">
                    <h3 className="text-lg font-medium text-white mb-4">Alertas</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-amber-900/30 border border-amber-600 rounded-md">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white text-sm">3 turmas precisam de professor</p>
                          <p className="text-amber-400 text-xs">Ação necessária</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-900/30 border border-blue-600 rounded-md">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm">Relatório mensal disponível</p>
                          <p className="text-blue-400 text-xs">Informativo</p>
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
                            <label htmlFor="metric1" className="text-white/70 text-sm">Taxa de conclusão</label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="metric2" 
                              className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                            />
                            <label htmlFor="metric2" className="text-white/70 text-sm">Tempo médio</label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="metric3" 
                              className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                            />
                            <label htmlFor="metric3" className="text-white/70 text-sm">Pontuação média</label>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="metric4" 
                              className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                            />
                            <label htmlFor="metric4" className="text-white/70 text-sm">Progresso por disciplina</label>
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
                    <h3 className="text-lg font-medium text-white">Configurações do Sistema</h3>
                    <p className="text-sm text-white/70">
                      Gerencie as configurações gerais da plataforma.
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-6">
                      {/* Configurações gerais */}
                      <div>
                        <h4 className="text-white text-base font-medium mb-3">Configurações Gerais</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-white/70 text-sm block mb-2">Nome da Plataforma</label>
                            <input 
                              type="text" 
                              defaultValue="SABI RPG"
                              className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm focus:border-[#bf7918] focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="text-white/70 text-sm block mb-2">Descrição</label>
                            <textarea 
                              rows={3}
                              defaultValue="Plataforma educacional gamificada para ensino básico"
                              className="bg-[#4a4639] text-white border border-[#D47C06] rounded p-2 w-full text-sm focus:border-[#bf7918] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Configurações de segurança */}
                      <div>
                        <h4 className="text-white text-base font-medium mb-3">Segurança</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">Autenticação em duas etapas</p>
                              <p className="text-white/50 text-xs">Requerer 2FA para todos os usuários</p>
                            </div>
                            <input type="checkbox" className="h-4 w-4" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">Sessões automáticas</p>
                              <p className="text-white/50 text-xs">Logout automático após inatividade</p>
                            </div>
                            <input type="checkbox" defaultChecked className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex space-x-3 pt-4 border-t border-[#D47C06]">
                        <Button className="bg-[#bf7918] text-white px-4 py-2 rounded hover:bg-[#a66617] transition-colors">
                          Salvar Alterações
                        </Button>
                        <Button className="bg-[#4a4639] border border-[#D47C06] text-white px-4 py-2 rounded hover:bg-[#57533f] hover:border-amber-400 transition-colors">
                          Cancelar
                        </Button>
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