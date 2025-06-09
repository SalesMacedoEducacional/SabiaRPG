import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  TotalEscolasCard, 
  TotalProfessoresCard, 
  TotalAlunosCard, 
  TotalTurmasCard 
} from "@/components/manager/ManagerDashboardCards";
import { EscolasVinculadasCard } from "@/components/manager/EscolasVinculadasCard";
import ManagerProfile from '../components/manager/ManagerProfile';
import ManagerSchoolRegistration from '../components/manager/ManagerSchoolRegistration';
import SchoolsList from '../components/manager/SchoolsList';
import TeachersList from '../components/manager/TeachersList';
import StudentsList from '../components/manager/StudentsList';
import UsersList from '../components/manager/UsersList';
import ClassesList from '../components/manager/ClassesList';

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
  PieChart,
  Briefcase,
  School as BuildingSchool,
  GraduationCap,
  BarChart3,
  UserPlus,
  Zap,
  Award,
  GanttChart,
  Menu,
  Search,
  PlusCircle,
  ArrowRightToLine,
  X
} from 'lucide-react';

/**
 * Dashboard do Gestor (Versão Moderna)
 * Interface atualizada com navegação lateral e design mais moderno
 */
export default function ManagerDashboardModerno() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Função para lidar com logout
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

  // Redirecionamento para página de login se usuário não estiver logado
  useEffect(() => {
    if (!user) {
      console.log("Redirecionando para login - usuário não autenticado");
      window.location.href = "/auth";
    }
  }, [user]);
  
  if (!user) {
    return null;
  }

  // Toggle do sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fecha menu mobile quando seleciona item
  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#312e26]">
      {/* Top Navigation Bar */}
      <header className="bg-[#312e26] border-b border-accent shadow-lg z-10">
        <div className="h-16 px-4 flex items-center justify-between">
          {/* Logo and Menu Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:text-accent"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex text-white hover:text-accent"
            >
              {sidebarOpen ? <ArrowRightToLine size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-cinzel font-bold text-white tracking-wide">
              SABIÁ<span className="text-accent">RPG</span> <span className="font-normal text-sm">GESTOR</span>
            </h1>
          </div>
          
          {/* Search and User Controls */}
          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-[#3a3730] text-white border border-[#4a4639] rounded-md px-3 py-1.5 pl-9 w-56 focus:outline-none focus:border-accent"
              />
              <Search size={16} className="absolute left-3 text-[#877d63]" />
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <p className="text-white text-sm font-medium">{"Gestor"}</p>
                <p className="text-accent text-xs">{user.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center">
                <User size={16} />
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-1.5 hover:bg-[#3a3730] rounded-md text-white"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
            <div className="bg-[#312e26] w-64 h-full overflow-y-auto border-r border-accent">
              <div className="p-4 flex justify-between items-center border-b border-accent">
                <h2 className="font-bold text-white text-lg">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-accent">
                  <X size={20} />
                </button>
              </div>
              
              {/* Mobile Menu Items */}
              <nav className="p-4 space-y-1">
                <button 
                  onClick={() => handleMenuSelect("overview")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "overview" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <Home size={18} />
                  <span>Visão Geral</span>
                </button>
                
                <button 
                  onClick={() => handleMenuSelect("schools")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "schools" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <BuildingSchool size={18} />
                  <span>Escolas</span>
                </button>
                
                <button 
                  onClick={() => handleMenuSelect("classes")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "classes" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <BookOpen size={18} />
                  <span>Turmas</span>
                </button>
                
                <button 
                  onClick={() => handleMenuSelect("users")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "users" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <Users size={18} />
                  <span>Usuários</span>
                </button>
                
                <button 
                  onClick={() => handleMenuSelect("reports")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "reports" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <FileBarChart2 size={18} />
                  <span>Relatórios</span>
                </button>
                
                <button 
                  onClick={() => handleMenuSelect("settings")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "settings" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <Settings size={18} />
                  <span>Configurações</span>
                </button>
                
                <button 
                  onClick={() => handleMenuSelect("profile")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${activeMenu === "profile" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"}`}
                >
                  <User size={18} />
                  <span>Meu Perfil</span>
                </button>
              </nav>
            </div>
          </div>
        )}
        
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block h-[calc(100vh-4rem)] transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'} bg-[#312e26] border-r border-accent`}>
          <nav className="pt-4 pb-12 h-full flex flex-col overflow-y-auto">
            <div className="px-2 space-y-1 mb-4">
              <button 
                onClick={() => setActiveMenu("overview")}
                className={`${activeMenu === "overview" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <Home size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Visão Geral</span>}
              </button>
              
              <div className={`ml-2 ${!sidebarOpen && 'hidden'}`}>
                <p className="text-accent text-xs uppercase font-bold tracking-wider py-2 mt-2">
                  Gestão
                </p>
              </div>
              
              <button 
                onClick={() => setActiveMenu("schools")}
                className={`${activeMenu === "schools" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <BuildingSchool size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Escolas</span>}
              </button>
              
              <button 
                onClick={() => setActiveMenu("classes")}
                className={`${activeMenu === "classes" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <BookOpen size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Turmas</span>}
              </button>
              
              <button 
                onClick={() => setActiveMenu("teachers")}
                className={`${activeMenu === "teachers" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <User size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Professores</span>}
              </button>
              
              <button 
                onClick={() => setActiveMenu("students")}
                className={`${activeMenu === "students" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <GraduationCap size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Alunos</span>}
              </button>
              
              <button 
                onClick={() => setActiveMenu("users")}
                className={`${activeMenu === "users" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <Users size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Usuários</span>}
              </button>
              
              <div className={`ml-2 ${!sidebarOpen && 'hidden'}`}>
                <p className="text-accent text-xs uppercase font-bold tracking-wider py-2 mt-2">
                  Analytics
                </p>
              </div>
              
              <button 
                onClick={() => setActiveMenu("reports")}
                className={`${activeMenu === "reports" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <FileBarChart2 size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Relatórios</span>}
              </button>
              
              <button 
                onClick={() => setActiveMenu("dashboard")}
                className={`${activeMenu === "dashboard" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <BarChart3 size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Estatísticas</span>}
              </button>
              
              <div className={`ml-2 ${!sidebarOpen && 'hidden'}`}>
                <p className="text-accent text-xs uppercase font-bold tracking-wider py-2 mt-2">
                  Configurações
                </p>
              </div>
              
              <button 
                onClick={() => setActiveMenu("settings")}
                className={`${activeMenu === "settings" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <Settings size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Sistema</span>}
              </button>
              
              <button 
                onClick={() => setActiveMenu("profile")}
                className={`${activeMenu === "profile" ? "bg-[#3a3730] text-accent" : "text-white hover:bg-[#3a3730]"} w-full flex items-center rounded-md px-2.5 py-2`}
              >
                <User size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-2">Meu Perfil</span>}
              </button>
            </div>
            
            {/* Bottom section (help, feedback) */}
            {sidebarOpen && (
              <div className="mt-auto px-3 py-3 border-t border-accent">
                <div className="bg-[#3a3730] rounded-lg p-3 text-center">
                  <div className="text-accent mb-1.5">
                    <Zap size={20} className="mx-auto" />
                  </div>
                  <p className="text-white text-sm mb-2">Precisa de ajuda?</p>
                  <button className="w-full text-xs bg-accent hover:bg-[#D47C06] text-white py-1 px-2 rounded transition-colors">
                    Suporte
                  </button>
                </div>
              </div>
            )}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto bg-[#27241c] p-4`}>
          {/* Page headings and main content */}
          {activeMenu === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
                  <p className="text-white/70">Painel de controle principal</p>
                </div>
                <div className="flex mt-2 md:mt-0 gap-2">
                  <button 
                    className="manager-button flex items-center gap-1.5"
                    onClick={() => navigate('/school-registration')}
                  >
                    <PlusCircle size={16} />
                    <span>Nova Escola</span>
                  </button>
                  <button 
                    className="manager-button flex items-center gap-1.5"
                    onClick={() => navigate('/user-registration')}
                  >
                    <UserPlus size={16} />
                    <span>Novo Usuário</span>
                  </button>
                </div>
              </div>
              
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden hover:border-accent transition-colors">
                  <EscolasVinculadasCard />
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden hover:border-accent transition-colors">
                  <TotalProfessoresCard />
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden hover:border-accent transition-colors">
                  <TotalAlunosCard />
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden hover:border-accent transition-colors">
                  <TotalTurmasCard />
                </div>
              </div>
              
              {/* Mid Section - Actions and Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Actions Card */}
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Ações Rápidas</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    <button 
                      className="w-full flex items-center justify-between p-2.5 rounded-md bg-[#3a3730] hover:bg-[#42403a] transition-colors text-white"
                      onClick={() => navigate('/user-registration')}
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-accent mr-2" />
                        <span>Cadastrar Novo Usuário</span>
                      </div>
                      <ChevronRight size={16} className="text-accent" />
                    </button>
                    
                    <button 
                      className="w-full flex items-center justify-between p-2.5 rounded-md bg-[#3a3730] hover:bg-[#42403a] transition-colors text-white"
                      onClick={() => navigate('/school-registration')}
                    >
                      <div className="flex items-center">
                        <School className="h-4 w-4 text-accent mr-2" />
                        <span>Cadastrar Nova Escola</span>
                      </div>
                      <ChevronRight size={16} className="text-accent" />
                    </button>
                    
                    <button 
                      className="w-full flex items-center justify-between p-2.5 rounded-md bg-[#3a3730] hover:bg-[#42403a] transition-colors text-white"
                      onClick={() => navigate('/turmas')}
                    >
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-accent mr-2" />
                        <span>Gerenciar Turmas</span>
                      </div>
                      <ChevronRight size={16} className="text-accent" />
                    </button>
                    
                    <button 
                      className="w-full flex items-center justify-between p-2.5 rounded-md bg-[#3a3730] hover:bg-[#42403a] transition-colors text-white"
                    >
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-accent mr-2" />
                        <span>Ver Progresso dos Alunos</span>
                      </div>
                      <ChevronRight size={16} className="text-accent" />
                    </button>
                  </div>
                </div>
                
                {/* Active Users Card */}
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Alunos Ativos</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#3a3730] p-3 rounded-lg">
                        <div className="text-accent text-xs">Últimos 7 dias</div>
                        <div className="text-white text-2xl font-bold mt-1">0</div>
                      </div>
                      <div className="bg-[#3a3730] p-3 rounded-lg">
                        <div className="text-accent text-xs">Últimos 30 dias</div>
                        <div className="text-white text-2xl font-bold mt-1">0</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-[#3a3730] p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">Taxa de Engajamento</span>
                        <span className="text-accent">0%</span>
                      </div>
                      <div className="w-full bg-[#27241c] rounded-full h-2 mt-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alert Card */}
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Alertas</h3>
                  </div>
                  <div className="p-4">
                    <div className="bg-[#3a3730] p-3 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-accent mr-2" />
                          <h4 className="text-white text-sm font-medium">Evasão Potencial</h4>
                        </div>
                        <span className="text-white text-xl font-bold">0</span>
                      </div>
                      <p className="text-white/70 text-xs mt-1">Alunos com mais de 30 dias sem acesso</p>
                    </div>
                    
                    <div className="bg-[#3a3730] p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 text-accent mr-2" />
                          <h4 className="text-white text-sm font-medium">Tarefas Pendentes</h4>
                        </div>
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <p className="text-white/70 text-xs mt-1">Escolas aguardando configuração</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section - Activity and Schools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-white font-medium">Atividade Recente</h3>
                    <button className="text-accent text-sm hover:underline">Ver Tudo</button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-[#3a3730] p-1.5 rounded-full mr-3 mt-0.5">
                          <FileText className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Novo relatório gerado</p>
                          <p className="text-white/70 text-xs">Relatório bimestral da Escola Municipal Pedro II</p>
                          <p className="text-accent text-xs">Hoje, 09:45</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-[#3a3730] p-1.5 rounded-full mr-3 mt-0.5">
                          <Users className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Novos usuários cadastrados</p>
                          <p className="text-white/70 text-xs">12 alunos adicionados à plataforma</p>
                          <p className="text-accent text-xs">Ontem, 15:30</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-[#3a3730] p-1.5 rounded-full mr-3 mt-0.5">
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
                
                {/* Schools List */}
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-white font-medium">Escolas Vinculadas</h3>
                    <button className="text-accent text-sm hover:underline" onClick={() => setActiveMenu("schools")}>Gerenciar</button>
                  </div>
                  <div className="p-4">
                    <SchoolsList />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeMenu === "profile" && (
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
                <p className="text-white/70">Gerencie suas informações pessoais</p>
              </div>
              
              <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                <div className="border-b border-accent/50 px-4 py-3">
                  <h3 className="text-white font-medium">Informações Pessoais</h3>
                </div>
                <div className="p-4">
                  <ManagerProfile userId={user.id.toString()} />
                </div>
              </div>
            </div>
          )}
          
          {activeMenu === "schools" && (
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Escolas</h1>
                <p className="text-white/70">Gerencie as escolas vinculadas</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-white font-medium">Escolas Cadastradas</h3>
                    <button className="manager-button flex items-center gap-1.5" onClick={() => navigate('/school-registration')}>
                      <PlusCircle size={16} />
                      <span>Nova Escola</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-white text-sm border-b border-accent/30">
                          <tr>
                            <th className="px-3 py-2">Nome</th>
                            <th className="px-3 py-2">Localização</th>
                            <th className="px-3 py-2">Turmas</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="text-white/80 text-sm">
                          <tr className="border-b border-accent/10 hover:bg-[#3a3730]">
                            <td className="px-3 py-2.5">Escola Municipal Pedro II</td>
                            <td className="px-3 py-2.5">Teresina, PI</td>
                            <td className="px-3 py-2.5">1</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                                Ativo
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center space-x-2">
                                <button className="text-accent hover:text-white">Editar</button>
                                <button className="text-accent hover:text-white">Detalhes</button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-accent/10 hover:bg-[#3a3730]">
                            <td className="px-3 py-2.5">Colégio Estadual José Alves</td>
                            <td className="px-3 py-2.5">Picos, PI</td>
                            <td className="px-3 py-2.5">1</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                                Ativo
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center space-x-2">
                                <button className="text-accent hover:text-white">Editar</button>
                                <button className="text-accent hover:text-white">Detalhes</button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeMenu === "teachers" && (
            <div>
              <TeachersList />
            </div>
          )}
          
          {activeMenu === "students" && (
            <div>
              <StudentsList />
            </div>
          )}
          
          {activeMenu === "users" && (
            <div>
              <UsersList />
            </div>
          )}
          
          {activeMenu === "classes" && (
            <div>
              <ClassesList />
            </div>
          )}
          

          
          {activeMenu === "reports" && (
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Relatórios</h1>
                <p className="text-white/70">Estatísticas e dados do sistema</p>
              </div>
              
              {/* Report Type Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#312e26] border border-accent/50 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a3730] hover:border-accent">
                  <div className="p-3 bg-[#3a3730] rounded-full mb-2">
                    <GraduationCap size={20} className="text-accent" />
                  </div>
                  <span className="text-white text-sm font-medium">Desempenho por Aluno</span>
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a3730] hover:border-accent">
                  <div className="p-3 bg-[#3a3730] rounded-full mb-2">
                    <BookOpen size={20} className="text-accent" />
                  </div>
                  <span className="text-white text-sm font-medium">Desempenho por Turma</span>
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a3730] hover:border-accent">
                  <div className="p-3 bg-[#3a3730] rounded-full mb-2">
                    <BuildingSchool size={20} className="text-accent" />
                  </div>
                  <span className="text-white text-sm font-medium">Desempenho por Escola</span>
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a3730] hover:border-accent">
                  <div className="p-3 bg-[#3a3730] rounded-full mb-2">
                    <BarChart3 size={20} className="text-accent" />
                  </div>
                  <span className="text-white text-sm font-medium">Análise de Engajamento</span>
                </div>
              </div>
              
              {/* Report Generator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Gerar Relatório</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-white text-sm mb-1.5">Escola</label>
                        <select className="w-full bg-[#3a3730] text-white border border-accent/50 rounded py-2 px-3 text-sm">
                          <option value="">Todas as escolas</option>
                          <option>Escola Municipal Pedro II</option>
                          <option>Colégio Estadual José Alves</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1.5">Turma</label>
                        <select className="w-full bg-[#3a3730] text-white border border-accent/50 rounded py-2 px-3 text-sm">
                          <option value="">Todas as turmas</option>
                          <option>Turma A</option>
                          <option>Turma B</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-white text-sm mb-1.5">Tipo de Relatório</label>
                        <select className="w-full bg-[#3a3730] text-white border border-accent/50 rounded py-2 px-3 text-sm">
                          <option>Desempenho</option>
                          <option>Engajamento</option>
                          <option>Missões</option>
                          <option>Estatístico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1.5">Período</label>
                        <select className="w-full bg-[#3a3730] text-white border border-accent/50 rounded py-2 px-3 text-sm">
                          <option>Últimos 7 dias</option>
                          <option>Últimos 30 dias</option>
                          <option>Último bimestre</option>
                          <option>Ano letivo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1.5">Formato</label>
                        <select className="w-full bg-[#3a3730] text-white border border-accent/50 rounded py-2 px-3 text-sm">
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>HTML</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="manager-button">Gerar Relatório</button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Relatórios Recentes</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="p-2 rounded hover:bg-[#3a3730] cursor-pointer">
                        <div className="flex items-center">
                          <FileBarChart2 size={16} className="text-accent mr-2" />
                          <span className="text-white text-sm">Desempenho Bimestral</span>
                        </div>
                        <p className="text-white/60 text-xs mt-1 ml-6">12/05/2023 · PDF</p>
                      </div>
                      
                      <div className="p-2 rounded hover:bg-[#3a3730] cursor-pointer">
                        <div className="flex items-center">
                          <FileBarChart2 size={16} className="text-accent mr-2" />
                          <span className="text-white text-sm">Engajamento Mensal</span>
                        </div>
                        <p className="text-white/60 text-xs mt-1 ml-6">05/05/2023 · Excel</p>
                      </div>
                      
                      <div className="p-2 rounded hover:bg-[#3a3730] cursor-pointer">
                        <div className="flex items-center">
                          <FileBarChart2 size={16} className="text-accent mr-2" />
                          <span className="text-white text-sm">Relatório de Missões</span>
                        </div>
                        <p className="text-white/60 text-xs mt-1 ml-6">01/05/2023 · PDF</p>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <button className="text-accent text-sm hover:text-white hover:underline">
                          Ver todos os relatórios
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeMenu === "settings" && (
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-white/70">Configurações do sistema</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Sistema</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Notificações</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">Alertas de Evasão</span>
                            <div className="h-5 w-10 bg-[#3a3730] rounded-full p-0.5 flex items-center cursor-pointer">
                              <div className="h-4 w-4 bg-accent rounded-full transform translate-x-5"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">Notificações por Email</span>
                            <div className="h-5 w-10 bg-[#3a3730] rounded-full p-0.5 flex items-center cursor-pointer">
                              <div className="h-4 w-4 bg-accent rounded-full transform translate-x-5"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">Relatórios Automáticos</span>
                            <div className="h-5 w-10 bg-[#3a3730] rounded-full p-0.5 flex items-center cursor-pointer">
                              <div className="h-4 w-4 bg-accent rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Limite de Usuários</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">Professores (por escola)</span>
                          <input 
                            type="number" 
                            className="w-20 bg-[#3a3730] text-white border border-accent/50 rounded py-1 px-2 text-sm" 
                            value="30" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Tempos Limite</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm">Sessão Inativa (minutos)</span>
                          <input 
                            type="number" 
                            className="w-20 bg-[#3a3730] text-white border border-accent/50 rounded py-1 px-2 text-sm" 
                            value="30" 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">Detecção de Evasão (dias)</span>
                          <input 
                            type="number" 
                            className="w-20 bg-[#3a3730] text-white border border-accent/50 rounded py-1 px-2 text-sm" 
                            value="30" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#312e26] border border-accent/50 rounded-lg overflow-hidden">
                  <div className="border-b border-accent/50 px-4 py-3">
                    <h3 className="text-white font-medium">Administração</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Backup</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">Backup Automático</span>
                          <div className="h-5 w-10 bg-[#3a3730] rounded-full p-0.5 flex items-center cursor-pointer">
                            <div className="h-4 w-4 bg-accent rounded-full transform translate-x-5"></div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <select className="w-full bg-[#3a3730] text-white border border-accent/50 rounded py-2 px-3 text-sm">
                            <option>Diariamente</option>
                            <option>Semanalmente</option>
                            <option>Mensalmente</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Manutenção</h4>
                        <div className="space-y-2">
                          <button className="w-full bg-[#3a3730] hover:bg-[#42403a] text-white py-2 px-3 rounded text-sm transition-colors">
                            Limpar Cache
                          </button>
                          <button className="w-full bg-[#3a3730] hover:bg-[#42403a] text-white py-2 px-3 rounded text-sm transition-colors">
                            Verificar Integridade
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Logs do Sistema</h4>
                        <div className="h-32 bg-[#27241c] p-2 rounded-md overflow-y-auto text-white/70 text-xs">
                          <p>[21/05/2023 04:15:22] Usuário logado: gestor@sabiarpg.edu.br</p>
                          <p>[21/05/2023 04:10:15] Sistema inicializado</p>
                          <p>[21/05/2023 03:55:30] Backup automático concluído</p>
                          <p>[20/05/2023 18:22:45] Usuário desconectado: gestor@sabiarpg.edu.br</p>
                          <p>[20/05/2023 17:35:12] Relatório gerado: Desempenho Bimestral</p>
                        </div>
                        <div className="mt-2 text-right">
                          <button className="text-accent text-sm hover:text-white hover:underline">
                            Ver todos os logs
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}