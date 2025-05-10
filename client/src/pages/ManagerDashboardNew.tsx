import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface SchoolData {
  id: string;
  name: string;
  code: string;
  teachers: number;
  students: number;
  active: boolean;
}

interface ReportData {
  id: string;
  title: string;
  type: string;
  date: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  profile: string;
  status: 'active' | 'inactive';
}

/**
 * Dashboard principal para o perfil Gestor - versão com design medieval
 */
export default function ManagerDashboard() {
  console.log("DASHBOARD GESTOR NOVO CARREGADO!");
  
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  
  // Força uso do componente correto
  useEffect(() => {
    // Verificar se estamos na rota do gestor
    if (window.location.pathname === '/manager') {
      console.log("Na página do gestor - Verificando usuário:", user);
      
      // Se não tem usuário ou não é gestor, redirecionar
      if (!user) {
        console.error("Usuário não autenticado no dashboard de gestor");
        setLocation('/auth');
        return;
      }
      
      if (user.role !== 'manager') {
        console.error("Usuário não é gestor, mas está no dashboard de gestor:", user.role);
        setLocation('/');
        return;
      }
      
      console.log("Usuário gestor confirmado:", user.role);
      
      // Se chegou aqui, é um gestor válido na página correta
      const forceManagerDashboard = localStorage.getItem('force_manager_dashboard');
      
      if (forceManagerDashboard === 'true') {
        console.log("Forçando carregamento do dashboard de gestor");
        localStorage.removeItem('force_manager_dashboard');
        // Permanece na página
      }
    }
  }, [user, setLocation]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState({
    schools: false,
    reports: false,
    users: false
  });
  
  // Dados estatísticos para o dashboard (serão buscados via API)
  const [stats, setStats] = useState({
    totalSchools: 0,
    activeSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeClasses: 0,
    activeStudents7Days: 0,
    activeStudents30Days: 0,
    potentialEvasion: 0,
    engagementLevel: 0,
    missionsInProgress: 0,
    missionsCompleted: 0,
    missionsPending: 0
  });
  
  // Buscar os dados iniciais
  useEffect(() => {
    fetchSchools();
    fetchReports();
    fetchUsers();
    fetchDashboardStats();
  }, []);
  
  const fetchDashboardStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/manager/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setStats({
            ...stats,
            ...data.stats
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };
  
  const fetchSchools = async () => {
    setLoading(prev => ({ ...prev, schools: true }));
    try {
      const response = await apiRequest('GET', '/api/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data || []);
      } else {
        throw new Error('Falha ao buscar escolas');
      }
    } catch (error) {
      console.error('Erro ao buscar escolas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de escolas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, schools: false }));
    }
  };
  
  const fetchReports = async () => {
    setLoading(prev => ({ ...prev, reports: true }));
    try {
      const response = await apiRequest('GET', '/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data || []);
      } else {
        throw new Error('Falha ao buscar relatórios');
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os relatórios.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };
  
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await apiRequest('GET', '/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };
  
  // Funções para as ações
  const handleNewUser = () => {
    setLocation('/user-registration');
  };
  
  const handleNewSchool = () => {
    setLocation('/school-registration');
  };
  
  const handleManageClasses = () => {
    setLocation('/class-management');
  };
  
  const handleGenerateReport = () => {
    setActiveTab('reports');
  };
  
  const handleViewEvasionList = () => {
    toast({
      title: "Lista de Evasão",
      description: "Funcionalidade em desenvolvimento",
    });
  };
  
  const handleViewDetailedReport = () => {
    toast({
      title: "Relatório Detalhado",
      description: "Funcionalidade em desenvolvimento",
    });
  };
  
  const handleViewAllActivities = () => {
    toast({
      title: "Atividades",
      description: "Funcionalidade em desenvolvimento",
    });
  };
  
  // Estilo personalizado para o tema medieval com cores escuras
  const styles = {
    container: "min-h-screen bg-[#231f20] text-white",
    header: "px-4 py-4 mb-4",
    heading: "text-2xl font-bold text-white",
    subheading: "text-gray-300",
    mainTabs: "px-4",
    tabsList: "grid grid-cols-4 gap-1 bg-[#231f20] mb-6",
    tabsTrigger: "bg-[#3e2a18] py-2 text-center text-gray-200 hover:text-white rounded-sm data-[state=active]:bg-[#a85f16] data-[state=active]:text-white",
    statsGrid: "grid grid-cols-4 gap-4 mb-6",
    statsCard: "bg-[#3e2a18] border-none rounded-sm p-4 shadow-none",
    statTitle: "text-sm font-medium text-white mb-2",
    statValue: "text-3xl font-bold text-white",
    statSubtext: "text-xs text-gray-300 mt-1",
    actionGrid: "grid grid-cols-3 gap-4 mb-6",
    mediumCard: "bg-[#3e2a18] border-none rounded-sm p-4 col-span-1 shadow-none",
    largeCard: "bg-[#3e2a18] border-none rounded-sm p-4 col-span-2 shadow-none",
    cardTitle: "text-white font-medium mb-2",
    cardContent: "mt-2",
    actionButton: "bg-[#3e2a18] hover:bg-[#a85f16] text-white border-none mt-2 w-full py-4 flex items-center justify-center gap-2",
    iconWrapper: "bg-[#3e2a18]/40 p-3 rounded-md",
    detailsGrid: "grid grid-cols-2 gap-4 mb-6",
    schoolsList: "space-y-4",
    schoolItem: "border-b border-amber-900/30 pb-4 last:border-b-0",
    schoolHeader: "flex justify-between items-center mb-2",
    schoolName: "font-medium",
    schoolStats: "flex justify-between text-xs text-amber-200/60 mt-2",
    progressBar: "h-2 bg-amber-900/40",
    progressIndicator: "bg-green-600",
    listWrapper: "mt-4 space-y-4",
    listItem: "flex gap-4 items-start pb-4 border-b border-amber-900/30",
    icon: "h-4 w-4",
    formGrid: "grid grid-cols-2 gap-4 mt-4",
    textField: "bg-amber-900/20 border-amber-900/50 text-amber-50",
    profileCard: "bg-[#2b1e13] border border-amber-900/50 rounded-md p-4 mb-4",
    tableHeader: "grid grid-cols-12 bg-amber-900/30 p-4 rounded-t-md font-medium",
    tableRow: "grid grid-cols-12 p-4 hover:bg-amber-900/20 cursor-pointer border-b border-amber-900/30",
    badge: {
      active: "bg-green-600/20 text-green-500 border-green-800",
      inactive: "bg-gray-600/20 text-gray-400 border-gray-700"
    }
  };

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={styles.heading}>DASHBOARD DO GESTOR</h1>
            <p className={styles.subheading}>Bem-vindo, gestor!</p>
          </div>
          <Button 
            variant="destructive"
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
            onClick={logout}
          >
            Sair
          </Button>
        </div>
      </header>
      
      {/* Abas principais */}
      <div className={styles.mainTabs}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="overview" className={styles.tabsTrigger}>
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="reports" className={styles.tabsTrigger}>
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="settings" className={styles.tabsTrigger}>
              Configurações
            </TabsTrigger>
            <TabsTrigger value="profile" className={styles.tabsTrigger}>
              Meu Perfil
            </TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da aba Visão Geral */}
          <TabsContent value="overview">
            {/* Cards de estatísticas gerais - exatamente como na imagem */}
            <div className={styles.statsGrid}>
              <div className={styles.statsCard}>
                <div className={styles.statTitle}>Total de Escolas Vinculadas</div>
                <div className={styles.statValue}>0</div>
                <div className={styles.statSubtext}>0 ativas</div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.statTitle}>Total de Professores</div>
                <div className={styles.statValue}>0</div>
                <div className={styles.statSubtext}>Em todas as escolas</div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.statTitle}>Total de Alunos</div>
                <div className={styles.statValue}>0</div>
                <div className={styles.statSubtext}>Em todas as escolas</div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.statTitle}>Turmas Ativas</div>
                <div className={styles.statValue}>0</div>
                <div className={styles.statSubtext}>Distribuídas em todas as escolas</div>
              </div>
            </div>
            
            {/* Cards de ação e estatísticas detalhadas */}
            <div className={styles.actionGrid}>
              {/* Ações rápidas */}
              <div className={styles.mediumCard}>
                <div className={styles.cardTitle}>Ações Rápidas</div>
                <div className={styles.statSubtext}>Acesso direto às principais tarefas administrativas</div>
                
                <div className="mt-3">
                  <Button
                    variant="outline"
                    onClick={handleNewUser}
                    className="w-full mb-2 bg-[#3e2a18] hover:bg-[#a85f16] text-white flex items-center justify-center gap-2 py-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    <span>Cadastrar Novo Usuário</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleNewSchool}
                    className="w-full mb-2 bg-[#3e2a18] hover:bg-[#a85f16] text-white flex items-center justify-center gap-2 py-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Cadastrar Nova Escola</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleManageClasses}
                    className="bg-amber-900/30 hover:bg-amber-800 text-amber-50 flex flex-col items-center p-4 h-auto"
                  >
                    <div className="mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M21 9H3" />
                        <path d="M9 21V9" />
                      </svg>
                    </div>
                    <span className="text-xs">Gerenciar Turmas</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleGenerateReport}
                    className="bg-amber-900/30 hover:bg-amber-800 text-amber-50 flex flex-col items-center p-4 h-auto"
                  >
                    <div className="mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <span className="text-xs">Gerar Relatórios</span>
                  </Button>
                </div>
              </div>
              
              {/* Alunos ativos */}
              <div className={styles.mediumCard}>
                <div className={styles.cardTitle}>Alunos Ativos na Plataforma</div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className={styles.statValue}>{stats.activeStudents7Days}</div>
                    <div className={styles.statSubtext}>Últimos 7 dias</div>
                  </div>
                  
                  <div>
                    <div className={styles.statValue}>{stats.activeStudents30Days}</div>
                    <div className={styles.statSubtext}>Últimos 30 dias</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className={styles.cardTitle}>Nível de Engajamento Geral</div>
                  <div className={styles.statValue}>{stats.engagementLevel}%</div>
                  <div className="mt-2">
                    <Progress 
                      value={stats.engagementLevel} 
                      className="h-2 bg-amber-900/40"
                    />
                  </div>
                  <div className={styles.statSubtext}>Baseado no tempo de uso e missões completadas</div>
                </div>
              </div>
              
              {/* Cards adicionais */}
              <div className={styles.mediumCard}>
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className={styles.cardTitle}>Alerta de Evasão Potencial</div>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-red-400">{stats.potentialEvasion} </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 ml-2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                    </div>
                    <div className={styles.statSubtext}>Alunos com mais de 10 dias sem acesso</div>
                    <Button onClick={handleViewEvasionList} className="w-full mt-2 text-xs bg-amber-800 hover:bg-amber-700 text-amber-50">
                      Ver Lista
                    </Button>
                  </div>
                  
                  <div>
                    <div className={styles.cardTitle}>Missões</div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold">{stats.missionsInProgress}</span>
                        <span className="text-xs text-amber-200/70">Em andamento</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold">{stats.missionsCompleted}</span>
                        <span className="text-xs text-amber-200/70">Concluídas</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold">{stats.missionsPending}</span>
                        <span className="text-xs text-amber-200/70">Pendentes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Escolas e Atividades */}
            <div className="grid grid-cols-2 gap-6">
              {/* Escolas com maior engajamento */}
              <div className={styles.statsCard}>
                <div className={styles.cardTitle}>Escolas com Maior Engajamento</div>
                <div className={styles.statSubtext}>Escolas com maiores taxas de participação</div>
                
                <div className="mt-4 space-y-4">
                  {schools.length > 0 ? (
                    schools.slice(0, 3).map((school, index) => (
                      <div key={school.id} className="border-b border-amber-900/30 pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/50 text-amber-200 mr-2 font-bold">
                              {index + 1}
                            </div>
                            <p className="font-medium text-amber-100">{school.name}</p>
                          </div>
                          <Badge className="bg-amber-900/40 text-amber-200 border-amber-900/70">
                            {Math.floor(75 + Math.random() * 15)}%
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.floor(75 + Math.random() * 15)} 
                          className="h-2 bg-amber-900/40" 
                        />
                        <div className="flex justify-between mt-2 text-xs text-amber-200/70">
                          <span>{school.teachers} professores</span>
                          <span>{school.students} alunos</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-amber-200/70">
                      Nenhuma escola cadastrada
                    </div>
                  )}
                  
                  {schools.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 border-amber-900/50 text-amber-200 hover:bg-amber-900/50"
                      onClick={handleViewDetailedReport}
                    >
                      Ver relatório detalhado
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Atividade recente */}
              <div className={styles.statsCard}>
                <div className={styles.cardTitle}>Atividade Recente</div>
                <div className={styles.statSubtext}>Últimas ações e eventos no sistema</div>
                
                <div className="mt-4 space-y-4">
                  <div className="flex gap-4 items-start pb-4 border-b border-amber-900/30">
                    <div className="bg-amber-900/30 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-100">Novo relatório gerado</p>
                      <p className="text-sm text-amber-200/70">Relatório bimestral da Escola Municipal Pedro II</p>
                      <p className="text-xs text-amber-200/50 mt-1">Hoje, 09:45</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start pb-4 border-b border-amber-900/30">
                    <div className="bg-amber-900/30 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" x2="19" y1="8" y2="14" />
                        <line x1="22" x2="16" y1="11" y2="11" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-100">Novos usuários cadastrados</p>
                      <p className="text-sm text-amber-200/70">12 alunos adicionados à plataforma</p>
                      <p className="text-xs text-amber-200/50 mt-1">Ontem, 15:20</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-amber-900/30 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-100">Alerta de engajamento</p>
                      <p className="text-sm text-amber-200/70">Queda de atividade em 2 turmas do 8º ano</p>
                      <p className="text-xs text-amber-200/50 mt-1">2 dias atrás</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 border-amber-900/50 text-amber-200 hover:bg-amber-900/50"
                    onClick={handleViewAllActivities}
                  >
                    Ver todas as atividades
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Conteúdo da aba Relatórios */}
          <TabsContent value="reports">
            <div className="grid grid-cols-3 gap-6">
              <div className={`${styles.statsCard} col-span-2`}>
                <div className={styles.cardTitle}>Gerador de Relatórios</div>
                <div className={styles.statSubtext}>Gere relatórios personalizados para análise de desempenho</div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Tipo de Relatório</label>
                    <Select defaultValue="class">
                      <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class">Por Turma</SelectItem>
                        <SelectItem value="school">Por Escola</SelectItem>
                        <SelectItem value="all">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Período</label>
                    <Select defaultValue="bimonthly">
                      <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bimonthly">Bimestral</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="semiannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Turma</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Turmas</SelectItem>
                        <SelectItem value="8a">8º Ano A</SelectItem>
                        <SelectItem value="8b">8º Ano B</SelectItem>
                        <SelectItem value="9a">9º Ano A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Escola</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                        <SelectValue placeholder="Selecione a escola" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Escolas</SelectItem>
                        {schools.map(school => (
                          <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm text-amber-200 mb-2">Formato de Exportação</label>
                  <RadioGroup defaultValue="pdf" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" className="text-amber-500" />
                      <label htmlFor="pdf" className="text-sm text-amber-200">PDF</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="xlsx" id="xlsx" className="text-amber-500" />
                      <label htmlFor="xlsx" className="text-sm text-amber-200">XLSX</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ods" id="ods" className="text-amber-500" />
                      <label htmlFor="ods" className="text-sm text-amber-200">ODS</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" className="text-amber-500" />
                      <label htmlFor="csv" className="text-sm text-amber-200">CSV</label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm text-amber-200 mb-2">Métricas a Incluir</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="performance" defaultChecked className="text-amber-500 border-amber-500" />
                      <label htmlFor="performance" className="text-sm text-amber-200">Desempenho</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="engagement" defaultChecked className="text-amber-500 border-amber-500" />
                      <label htmlFor="engagement" className="text-sm text-amber-200">Engajamento</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="missions" defaultChecked className="text-amber-500 border-amber-500" />
                      <label htmlFor="missions" className="text-sm text-amber-200">Missões</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="paths" defaultChecked className="text-amber-500 border-amber-500" />
                      <label htmlFor="paths" className="text-sm text-amber-200">Trilhas</label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M2 12h20" />
                      <path d="M12 2v20" />
                    </svg>
                    Visualizar Prévia
                  </Button>
                </div>
              </div>
              
              <div className={styles.statsCard}>
                <div className={styles.cardTitle}>Relatórios Recentes</div>
                <div className={styles.statSubtext}>Relatórios gerados nos últimos 30 dias</div>
                
                <div className="mt-4 space-y-4">
                  <div className={`${styles.statsCard} p-3`}>
                    <div className="flex justify-between items-center">
                      <div className="text-xs uppercase font-bold text-amber-300">School</div>
                      <div className="text-xs text-amber-200/70">20/04/2023</div>
                    </div>
                    <div className="font-medium mt-1">DESEMPENHO ESCOLAR 2023</div>
                    <Button variant="outline" className="w-full mt-2 text-xs border-amber-900/50 text-amber-200 hover:bg-amber-900/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      Download
                    </Button>
                  </div>
                  
                  <div className={`${styles.statsCard} p-3`}>
                    <div className="flex justify-between items-center">
                      <div className="text-xs uppercase font-bold text-amber-300">Region</div>
                      <div className="text-xs text-amber-200/70">15/03/2023</div>
                    </div>
                    <div className="font-medium mt-1">PROGRESSO REGIONAL</div>
                    <Button variant="outline" className="w-full mt-2 text-xs border-amber-900/50 text-amber-200 hover:bg-amber-900/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      Download
                    </Button>
                  </div>
                  
                  <div className={`${styles.statsCard} p-3`}>
                    <div className="flex justify-between items-center">
                      <div className="text-xs uppercase font-bold text-amber-300">School</div>
                      <div className="text-xs text-amber-200/70">10/05/2023</div>
                    </div>
                    <div className="font-medium mt-1">ESTATÍSTICAS DE USO</div>
                    <Button variant="outline" className="w-full mt-2 text-xs border-amber-900/50 text-amber-200 hover:bg-amber-900/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      Download
                    </Button>
                  </div>
                  
                  <Button className="w-full bg-amber-800 hover:bg-amber-700 text-amber-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 12a9 9 0 0 1-9 9" />
                      <path d="M9 3a9 9 0 0 1 9 9" />
                      <path d="M13.6 8.4a6 6 0 0 1 0 8" />
                      <path d="M15 3a18 18 0 0 1 0 18" />
                      <path d="M3 16v-2a2 2 0 0 1 2-2h6" />
                      <path d="m7 16 4-4-4-4" />
                    </svg>
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>
            
            <div className={`${styles.statsCard} mt-6`}>
              <div className={styles.cardTitle}>Relatórios Disponíveis</div>
              <div className={styles.statSubtext}>Lista completa de relatórios para download</div>
              
              <div className="mt-4 border border-amber-900/30 rounded-md overflow-hidden">
                <div className="grid grid-cols-12 bg-amber-900/40 py-3 px-4 font-medium text-amber-200">
                  <div className="col-span-5">Título</div>
                  <div className="col-span-2">Tipo</div>
                  <div className="col-span-2">Data</div>
                  <div className="col-span-2">Formato</div>
                  <div className="col-span-1">Ações</div>
                </div>
                
                <div className="grid grid-cols-12 py-3 px-4 border-b border-amber-900/30 hover:bg-amber-900/20">
                  <div className="col-span-5 font-medium">Desempenho Escolar 2023</div>
                  <div className="col-span-2">School</div>
                  <div className="col-span-2">20/04/2023</div>
                  <div className="col-span-2">PDF</div>
                  <div className="col-span-1 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 py-3 px-4 border-b border-amber-900/30 hover:bg-amber-900/20">
                  <div className="col-span-5 font-medium">Progresso Regional</div>
                  <div className="col-span-2">Region</div>
                  <div className="col-span-2">15/03/2023</div>
                  <div className="col-span-2">PDF</div>
                  <div className="col-span-1 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 py-3 px-4 hover:bg-amber-900/20">
                  <div className="col-span-5 font-medium">Estatísticas de Uso</div>
                  <div className="col-span-2">School</div>
                  <div className="col-span-2">10/05/2023</div>
                  <div className="col-span-2">PDF</div>
                  <div className="col-span-1 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Conteúdo da aba Configurações */}
          <TabsContent value="settings">
            <div className="grid grid-cols-3 gap-6">
              <div className={`${styles.statsCard} col-span-2`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={styles.cardTitle}>Gerenciamento de Escolas</div>
                    <div className={styles.statSubtext}>Cadastre e gerencie escolas na plataforma</div>
                  </div>
                  <Button 
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50"
                    onClick={handleNewSchool}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Nova Escola
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="relative flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/70">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <Input 
                      placeholder="Buscar escolas..." 
                      className="pl-10 bg-amber-900/20 border-amber-900/50 text-amber-50"
                    />
                  </div>
                  
                  <div className="ml-4">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32 bg-amber-900/20 border-amber-900/50 text-amber-50">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="active">Ativas</SelectItem>
                        <SelectItem value="inactive">Inativas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 border border-amber-900/30 rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 bg-amber-900/40 py-3 px-4 font-medium text-amber-200">
                    <div className="col-span-4">Nome</div>
                    <div className="col-span-2">Código</div>
                    <div className="col-span-2">Alunos</div>
                    <div className="col-span-2">Professores</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Ações</div>
                  </div>
                  
                  {schools.length > 0 ? (
                    schools.map((school) => (
                      <div 
                        key={school.id} 
                        className="grid grid-cols-12 py-3 px-4 border-b border-amber-900/30 last:border-0 hover:bg-amber-900/20"
                      >
                        <div className="col-span-4 font-medium">{school.name}</div>
                        <div className="col-span-2 text-amber-200/70">{school.code}</div>
                        <div className="col-span-2">{school.students}</div>
                        <div className="col-span-2">{school.teachers}</div>
                        <div className="col-span-1">
                          <Badge className={school.active 
                            ? "bg-green-900/30 text-green-500 border-green-900/70" 
                            : "bg-gray-900/30 text-gray-400 border-gray-900/70"
                          }>
                            {school.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m22 4-10 12.5L3 11" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200 hover:text-amber-100 hover:bg-amber-900/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-amber-200/70">
                      Nenhuma escola cadastrada
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className={styles.statsCard}>
                  <div className={styles.cardTitle}>Temas Prioritários</div>
                  <div className={styles.statSubtext}>Selecione áreas de conhecimento prioritárias</div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="math" defaultChecked className="text-amber-500 border-amber-500" />
                      <label htmlFor="math" className="text-sm text-amber-200">Matemática</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="portuguese" defaultChecked className="text-amber-500 border-amber-500" />
                      <label htmlFor="portuguese" className="text-sm text-amber-200">Português</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="science" className="text-amber-500 border-amber-500" />
                      <label htmlFor="science" className="text-sm text-amber-200">Ciências</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="history" className="text-amber-500 border-amber-500" />
                      <label htmlFor="history" className="text-sm text-amber-200">História</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="geography" className="text-amber-500 border-amber-500" />
                      <label htmlFor="geography" className="text-sm text-amber-200">Geografia</label>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-amber-800 hover:bg-amber-700 text-amber-50">
                    Adicionar Tema
                  </Button>
                </div>
                
                <div className={`${styles.statsCard} mt-6`}>
                  <div className={styles.cardTitle}>Permissões de Perfis</div>
                  <div className={styles.statSubtext}>Configure permissões básicas dos perfis</div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-amber-200 mb-2">Professores podem:</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="create_content" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="create_content" className="text-sm text-amber-200">Criar conteúdo</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manage_class" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="manage_class" className="text-sm text-amber-200">Gerenciar coordenador</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manage_students" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="manage_students" className="text-sm text-amber-200">Gerenciar alunos</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="view_class_reports" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="view_class_reports" className="text-sm text-amber-200">Ver relatórios de turma</label>
                      </div>
                    </div>
                    
                    <p className="text-sm text-amber-200 mb-2 mt-4">Alunos podem:</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="participate_forum" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="participate_forum" className="text-sm text-amber-200">Participar do fórum</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="view_certificate" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="view_certificate" className="text-sm text-amber-200">Ver certificados</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="submit_questions" defaultChecked className="text-amber-500 border-amber-500" />
                        <label htmlFor="submit_questions" className="text-sm text-amber-200">Enviar dúvidas</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-amber-800 hover:bg-amber-700 text-amber-50">
                    Salvar Permissões
                  </Button>
                </div>
                
                <div className={`${styles.statsCard} mt-6`}>
                  <div className={styles.cardTitle}>Integrações</div>
                  <div className={styles.statSubtext}>Configure integrações com outros sistemas</div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" x2="8" y1="13" y2="13" />
                            <line x1="16" x2="8" y1="17" y2="17" />
                            <line x1="10" x2="8" y1="9" y2="9" />
                          </svg>
                        </div>
                        <div className="text-sm text-amber-200">Google Classroom</div>
                      </div>
                      <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs h-8">
                        Conectar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                            <path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6" />
                            <path d="M3 12c0-1.2 4-6 9-6s9 4.8 9 6" />
                          </svg>
                        </div>
                        <div className="text-sm text-amber-200">SIGE</div>
                      </div>
                      <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs h-8">
                        Conectar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`${styles.statsCard} mt-6`}>
              <div className={styles.cardTitle}>Cronograma de Triagens e Missões</div>
              <div className={styles.statSubtext}>Configure datas e períodos para atividades do sistema</div>
              
              <div className="grid grid-cols-3 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Período de Triagem Diagnóstica</label>
                  <Select defaultValue="start_semester">
                    <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start_semester">Início do Semestre</SelectItem>
                      <SelectItem value="mid_semester">Meio do Semestre</SelectItem>
                      <SelectItem value="end_semester">Final do Semestre</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Liberação de Missões</label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Duração da Triagem (dias)</label>
                  <Input 
                    type="number" 
                    defaultValue="7" 
                    className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Dia da Semana para Novas Missões</label>
                  <Select defaultValue="monday">
                    <SelectTrigger className="bg-amber-900/20 border-amber-900/50 text-amber-50">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Segunda-feira</SelectItem>
                      <SelectItem value="tuesday">Terça-feira</SelectItem>
                      <SelectItem value="wednesday">Quarta-feira</SelectItem>
                      <SelectItem value="thursday">Quinta-feira</SelectItem>
                      <SelectItem value="friday">Sexta-feira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Prazo para Conclusão (dias)</label>
                  <Input 
                    type="number" 
                    defaultValue="14" 
                    className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                  />
                </div>
                
                <div className="flex items-end">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox id="auto_notifications" defaultChecked className="text-amber-500 border-amber-500" />
                    <label htmlFor="auto_notifications" className="text-sm text-amber-200">Enviar notificações automáticas</label>
                  </div>
                </div>
              </div>
              
              <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50 mt-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
          
          {/* Conteúdo da aba Meu Perfil */}
          <TabsContent value="profile">
            <div className="grid grid-cols-3 gap-6">
              <div className={`${styles.statsCard} col-span-2`}>
                <div className={styles.cardTitle}>Informações Pessoais</div>
                <div className={styles.statSubtext}>Atualize seus dados pessoais e de contato</div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Nome Completo</label>
                    <Input 
                      type="text" 
                      defaultValue="Gestor de Teste" 
                      className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">E-mail</label>
                    <Input 
                      type="email" 
                      defaultValue="gestor@exemplo.com" 
                      className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Telefone</label>
                    <Input 
                      type="tel" 
                      defaultValue="(88) 99876-5432" 
                      className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-amber-200 mb-2">Cargo</label>
                    <Input 
                      type="text" 
                      defaultValue="Diretor" 
                      className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm text-amber-200 mb-2">Biografia</label>
                  <textarea 
                    rows={3}
                    defaultValue="Diretor na Escola Municipal Pedro II há 8 anos. Especialista em Gestão Educacional."
                    className="w-full rounded-md bg-amber-900/20 border-amber-900/50 text-amber-50 p-2"
                  />
                </div>
                
                <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50 mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Salvar Alterações
                </Button>
              </div>
              
              <div>
                <div className={styles.statsCard}>
                  <div className={styles.cardTitle}>Foto de Perfil</div>
                  <div className={styles.statSubtext}>Altere sua foto ou escolha um avatar</div>
                  
                  <div className="flex justify-center mt-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-amber-900/60 flex items-center justify-center text-amber-50 text-2xl">
                        GO
                      </div>
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-amber-800 flex items-center justify-center text-white border-2 border-amber-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                    <div className="h-16 w-16 rounded-md bg-amber-900/40 border border-amber-900/50"></div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-amber-800 hover:bg-amber-700 text-amber-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    Enviar Foto
                  </Button>
                </div>
                
                <div className={`${styles.statsCard} mt-6`}>
                  <div className={styles.cardTitle}>Registros de Acesso</div>
                  <div className={styles.statSubtext}>Histórico de acesso à sua conta</div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">Login bem-sucedido</div>
                        <div className="text-xs text-amber-200/70">Hoje, 08:15</div>
                      </div>
                      <Badge className="bg-amber-900/30 text-amber-200 border-amber-900/70">Teresina, PI</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">Login bem-sucedido</div>
                        <div className="text-xs text-amber-200/70">Ontem, 15:48</div>
                      </div>
                      <Badge className="bg-amber-900/30 text-amber-200 border-amber-900/70">Teresina, PI</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">Login bem-sucedido</div>
                        <div className="text-xs text-amber-200/70">25/04/2023, 09:22</div>
                      </div>
                      <Badge className="bg-amber-900/30 text-amber-200 border-amber-900/70">Teresina, PI</Badge>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.statsCard} mt-6`}>
                  <div className={styles.cardTitle}>Permissões</div>
                  <div className={styles.statSubtext}>Suas permissões na plataforma</div>
                  
                  <div className="mt-4 space-y-2">
                    <Badge className="w-full justify-start text-sm py-2 px-3 bg-amber-800/70 hover:bg-amber-800 text-amber-50 border-amber-900/70">
                      Gerenciar Escolas
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3 bg-amber-800/70 hover:bg-amber-800 text-amber-50 border-amber-900/70">
                      Gerenciar Usuários
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3 bg-amber-800/70 hover:bg-amber-800 text-amber-50 border-amber-900/70">
                      Configurar Sistema
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3 bg-amber-800/70 hover:bg-amber-800 text-amber-50 border-amber-900/70">
                      Gerar Relatórios
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3 bg-amber-800/70 hover:bg-amber-800 text-amber-50 border-amber-900/70">
                      Administrar Conteúdos
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`${styles.statsCard} mt-6`}>
              <div className={styles.cardTitle}>Segurança</div>
              <div className={styles.statSubtext}>Gerencie sua senha e configurações de segurança</div>
              
              <div className="grid grid-cols-3 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Senha Atual</label>
                  <Input 
                    type="password" 
                    className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Nova Senha</label>
                  <Input 
                    type="password" 
                    className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200 mb-2">Confirmar Nova Senha</label>
                  <Input 
                    type="password" 
                    className="bg-amber-900/20 border-amber-900/50 text-amber-50"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify_logins" defaultChecked className="text-amber-500 border-amber-500" />
                  <label htmlFor="notify_logins" className="text-sm text-amber-200">Receber notificações de novos logins</label>
                </div>
              </div>
              
              <Button className="mt-4 bg-amber-800 hover:bg-amber-700 text-amber-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Atualizar Senha
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}