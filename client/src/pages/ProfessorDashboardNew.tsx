import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Home,
  Users,
  BookOpen,
  FileText,
  Brain,
  Award,
  Menu,
  ArrowLeftFromLine,
  PlusCircle,
  Search,
  User,
  ChevronDown,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Shield,
  X,
  BarChart3,
  Activity,
  AlertTriangle,
  Trophy,
  Eye,
  Timer,
  Users2,
  Book,
  Star
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';

// Schemas de validação
const planoAulaSchema = z.object({
  turma_componente_id: z.string().min(1, "Selecione um componente"),
  trimestre: z.enum(["1º", "2º", "3º"]),
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório"),
});

const missaoSchema = z.object({
  turma_componente_id: z.string().min(1, "Selecione um componente"),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dificuldade: z.number().min(1).max(5),
  xp_reward: z.number().min(1),
  tempo_estimado: z.number().min(5),
});

type PlanoAulaForm = z.infer<typeof planoAulaSchema>;
type MissaoForm = z.infer<typeof missaoSchema>;

export default function ProfessorDashboardNew() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries para as 4 abas do dashboard
  const { data: turmasData } = useQuery({
    queryKey: ['/api/professor/turmas-detalhes'],
    enabled: !!user?.id,
  });

  const { data: componentesData } = useQuery({
    queryKey: ['/api/professor/componentes-detalhes'],
    enabled: !!user?.id,
  });

  const { data: planosData } = useQuery({
    queryKey: ['/api/professor/planos-detalhes'],
    enabled: !!user?.id,
  });

  const { data: alunosData } = useQuery({
    queryKey: ['/api/professor/alunos-detalhes'],
    enabled: !!user?.id,
  });

  const { data: engajamentoData } = useQuery({
    queryKey: ['/api/professor/engajamento'],
    enabled: !!user?.id,
  });

  const { data: loginTrends } = useQuery({
    queryKey: ['/api/professor/login-trends'],
    enabled: !!user?.id,
  });

  const { data: alunosAtivos } = useQuery({
    queryKey: ['/api/professor/alunos-ativos'],
    enabled: !!user?.id,
  });

  const { data: alunosRisco } = useQuery({
    queryKey: ['/api/professor/alunos-risco'],
    enabled: !!user?.id,
  });

  const { data: desempenhoData } = useQuery({
    queryKey: ['/api/professor/desempenho'],
    enabled: !!user?.id,
  });

  const { data: rankingXP } = useQuery({
    queryKey: ['/api/professor/ranking-xp'],
    enabled: !!user?.id,
  });

  const { data: progressoComponentes } = useQuery({
    queryKey: ['/api/professor/progresso-componentes'],
    enabled: !!user?.id,
  });

  const { data: relatoriosData } = useQuery({
    queryKey: ['/api/professor/relatorios'],
    enabled: !!user?.id,
  });

  const { data: evolucaoTrimestral } = useQuery({
    queryKey: ['/api/professor/evolucao-trimestral'],
    enabled: !!user?.id,
  });

  const { data: tempoMedioMissoes } = useQuery({
    queryKey: ['/api/professor/tempo-medio-missoes'],
    enabled: !!user?.id,
  });

  const { data: atividadesFuturas } = useQuery({
    queryKey: ['/api/professor/atividades-futuras'],
    enabled: !!user?.id,
  });

  const { data: conquistasColetivas } = useQuery({
    queryKey: ['/api/professor/conquistas-coletivas'],
    enabled: !!user?.id,
  });

  // Cores da paleta
  const COLORS = {
    primary: '#4DA3A9',
    secondary: '#D4A054', 
    tertiary: '#A6E3E9',
    quaternary: '#FFC23C',
    dark: '#312E26'
  };

  // Abas do dashboard
  const tabs = [
    { id: "visao-geral", label: "Visão Geral", icon: Home },
    { id: "engajamento", label: "Engajamento", icon: TrendingUp },
    { id: "desempenho", label: "Desempenho", icon: Award },
    { id: "relatorios", label: "Relatórios & Futuro", icon: FileText },
  ];

  // Estado da interface
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isMissaoModalOpen, setIsMissaoModalOpen] = useState(false);
  const [selectedDetailModal, setSelectedDetailModal] = useState("");
  const [filterTurma, setFilterTurma] = useState("");
  const [filterComponente, setFilterComponente] = useState("");

  // Função para logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/auth';
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  // Forms
  const planoForm = useForm<PlanoAulaForm>({
    resolver: zodResolver(planoAulaSchema),
    defaultValues: {
      trimestre: "1º",
      titulo: "",
      conteudo: "",
      turma_componente_id: "",
    },
  });

  const missaoForm = useForm<MissaoForm>({
    resolver: zodResolver(missaoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      dificuldade: 1,
      xp_reward: 10,
      tempo_estimado: 30,
      turma_componente_id: "",
    },
  });

  // Queries
  const { data: minhasTurmas = [] } = useQuery({
    queryKey: ["/api/professor/minhas-turmas"],
    enabled: !!user,
  });

  const { data: meusComponentes = [] } = useQuery({
    queryKey: ["/api/professor/meus-componentes"],
    enabled: !!user,
  });

  const { data: planosAula = [] } = useQuery({
    queryKey: ["/api/professor/planos-aula"],
    enabled: !!user,
  });

  const { data: missoes = [] } = useQuery({
    queryKey: ["/api/professor/missoes"],
    enabled: !!user,
  });

  const { data: meusAlunos = [] } = useQuery({
    queryKey: ["/api/professor/meus-alunos"],
    enabled: !!user,
  });

  const { data: vinculos = [] } = useQuery({
    queryKey: ["/api/professor/vinculos"],
    enabled: !!user,
  });

  // Mutations
  const createPlanoMutation = useMutation({
    mutationFn: (data: PlanoAulaForm) => apiRequest("/api/professor/planos-aula", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professor/planos-aula"] });
      setIsPlanoModalOpen(false);
      planoForm.reset();
      toast({
        title: "Sucesso",
        description: "Plano de aula criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar plano de aula",
        variant: "destructive",
      });
    },
  });

  const createMissaoMutation = useMutation({
    mutationFn: (data: MissaoForm) => apiRequest("/api/professor/missoes", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professor/missoes"] });
      setIsMissaoModalOpen(false);
      missaoForm.reset();
      toast({
        title: "Sucesso",
        description: "Missão criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro", 
        description: "Erro ao criar missão",
        variant: "destructive",
      });
    },
  });

  // Menu items com ícones
  const menuItems = [
    { id: "dashboard", label: "Visão Geral", icon: Home },
    { id: "turmas", label: "Turmas", icon: Users },
    { id: "componentes", label: "Componentes", icon: BookOpen },
    { id: "planos", label: "Planos de Aula", icon: FileText },
    { id: "missoes", label: "Missões", icon: Brain },
    { id: "alunos", label: "Alunos", icon: Award },
  ];

  // Componente do menu lateral
  const Sidebar = () => (
    <div className={`
      fixed inset-y-0 left-0 z-50 bg-[var(--background-card)] 
      border-r border-[var(--border-card)] transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'w-64' : 'w-16'}
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Header do Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-card)]">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} text-[var(--text-primary)]`}>
          <h2 className="text-xl font-bold">SABI RPG</h2>
          <p className="text-sm text-[var(--text-secondary)]">Professor</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
        >
          {sidebarOpen ? <ArrowLeftFromLine className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${activeMenu === item.id 
                  ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-lg' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] hover:text-[var(--text-primary)]'
                }
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Header
  const Header = () => (
    <header className="bg-[var(--background-secondary)] border-b border-[var(--border-card)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Bem-vindo(a), {user?.nome}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-[var(--background-input)] border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--border-focus)]"
            />
          </div>
          
          {/* Perfil do usuário no header superior direito */}
          <div className="relative">
            <button
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="flex items-center gap-2 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">{user?.nome || 'Professor'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Popup do perfil */}
            {showProfilePopup && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--background-card)] border border-[var(--border-card)] rounded-lg shadow-xl p-2 z-50">
                <div className="px-3 py-2 border-b border-[var(--border-card)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{user?.nome || 'Professor'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] rounded-md"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--background-elevated)]"
          >
            <Shield className="h-4 w-4 mr-2" />
            Suporte
          </Button>
        </div>
      </div>
    </header>
  );

  // Cards de estatísticas
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedDetailModal("turmas")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Turmas</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
            </div>
            <Users className="h-8 w-8 text-[#4DA3A9]" />
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Eye className="h-3 w-3 mr-1" />
            Ver Detalhes
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedDetailModal("componentes")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Componentes</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">4</p>
            </div>
            <BookOpen className="h-8 w-8 text-[#D4A054]" />
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Eye className="h-3 w-3 mr-1" />
            Ver Detalhes
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedDetailModal("planos")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Planos de Aula</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">5</p>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                1º Tri: 3 | 2º Tri: 2 | 3º Tri: 0
              </div>
            </div>
            <FileText className="h-8 w-8 text-[#A6E3E9]" />
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Eye className="h-3 w-3 mr-1" />
            Ver Detalhes
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedDetailModal("alunos")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Alunos</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">45</p>
            </div>
            <Award className="h-8 w-8 text-[#FFC23C]" />
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Eye className="h-3 w-3 mr-1" />
            Ver Detalhes
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Conteúdo principal baseado no menu ativo
  // Componente para renderizar modais de detalhes
  const renderDetailModal = () => {
    if (!selectedDetailModal) return null;

    return (
      <Dialog open={!!selectedDetailModal} onOpenChange={() => setSelectedDetailModal("")}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes - {selectedDetailModal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <Select value={filterTurma} onValueChange={setFilterTurma}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por Turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as Turmas</SelectItem>
                  {turmasData?.turmas?.map((turma: any) => (
                    <SelectItem key={turma.id} value={turma.id}>{turma.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterComponente} onValueChange={setFilterComponente}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por Componente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Componentes</SelectItem>
                  {componentesData?.componentes?.map((comp: any) => (
                    <SelectItem key={comp.id} value={comp.id}>{comp.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Conteúdo do modal baseado no tipo */}
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderModalContent = () => {
    switch (selectedDetailModal) {
      case "turmas":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turmasData?.map((turma: any) => (
              <Card key={turma.id}>
                <CardContent className="p-4">
                  <h3 className="font-medium">{turma.nome}</h3>
                  <p className="text-sm text-gray-600">Série: {turma.serie}</p>
                  <p className="text-sm text-gray-600">Modalidade: {turma.modalidade}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case "componentes":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {componentesData?.map((comp: any) => (
              <Card key={comp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: comp.cor_hex || '#4DA3A9' }}
                    />
                    <h3 className="font-medium">{comp.nome}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{comp.area}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case "alunos":
        return (
          <div className="space-y-4">
            {alunosData?.map((aluno: any) => (
              <Card key={aluno.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Nome</p>
                      <p className="text-sm text-gray-600">{aluno.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Matrícula</p>
                      <p className="text-sm text-gray-600">{aluno.matricula}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">CPF</p>
                      <p className="text-sm text-gray-600">{aluno.cpf}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">E-mail</p>
                      <p className="text-sm text-gray-600">{aluno.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      default:
        return <div>Dados não disponíveis</div>;
    }
  };

  // Função para renderizar conteúdo das abas
  const renderTabContent = () => {
    switch (activeTab) {
      case "visao-geral":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card Turmas */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turmas</CardTitle>
                <Users className="h-4 w-4 text-[var(--primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setSelectedDetailModal("turmas")}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Card Componentes */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Componentes</CardTitle>
                <BookOpen className="h-4 w-4 text-[var(--secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setSelectedDetailModal("componentes")}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Card Planos de Aula */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planos de Aula</CardTitle>
                <FileText className="h-4 w-4 text-[var(--accent)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setSelectedDetailModal("planos")}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Card Alunos */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                <Award className="h-4 w-4 text-[var(--warning)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setSelectedDetailModal("alunos")}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
            
            {/* Oito cards adicionais organizados em grade 4x2 responsiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full">
            {/* Tarefas Pendentes de Correção */}
            <Card className="bg-[var(--background-card)] border-[#FFC23C] border rounded-xl h-[160px] group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[var(--text-secondary)] text-base font-semibold mb-2">Tarefas Pendentes de Correção</h3>
                    <div className="text-4xl font-bold text-[#D4A054]">18</div>
                  </div>
                  <div className="text-xl">📝</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-auto mx-auto border-[#FFC23C] text-[#FFC23C] hover:bg-[#FFC23C] hover:text-white transition-colors"
                  aria-label="Ver detalhes das tarefas pendentes de correção"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Tempo Médio de Preparação */}
            <Card className="bg-[var(--background-card)] border-[#FFC23C] border rounded-xl h-[160px] group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[var(--text-secondary)] text-base font-semibold mb-2">Tempo Médio de Preparação</h3>
                    <div className="text-4xl font-bold text-[#4DA3A9]">25 min</div>
                  </div>
                  <div className="text-xl">⏱️</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-auto mx-auto border-[#FFC23C] text-[#FFC23C] hover:bg-[#FFC23C] hover:text-white transition-colors"
                  aria-label="Ver detalhes do tempo médio de preparação"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Feedback dos Alunos */}
            <Card className="bg-[var(--background-card)] border-[#FFC23C] border rounded-xl h-[160px] group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[var(--text-secondary)] text-base font-semibold mb-2">Feedback dos Alunos</h3>
                    <div className="text-2xl font-bold">
                      <span className="text-[#8BC34A]">+123 👍</span>
                      <span className="text-[var(--text-secondary)] mx-2">•</span>
                      <span className="text-[#E57373]">-12 👎</span>
                    </div>
                  </div>
                  <div className="text-xl">💬</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-auto mx-auto border-[#FFC23C] text-[#FFC23C] hover:bg-[#FFC23C] hover:text-white transition-colors"
                  aria-label="Ver detalhes do feedback dos alunos"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Taxa de Retenção por Componente */}
            <Card className="bg-[var(--background-card)] border-[#FFC23C] border rounded-xl h-[160px] group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-[#1e40af] font-bold text-sm mb-3 tracking-wide uppercase">
                        Taxa de Retenção
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#4DA3A9] font-bold">Ciências</span>
                          <span className="font-black text-[#4DA3A9] text-sm">84%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#4DA3A9] to-[#6BC2C9] h-2 rounded-full shadow-sm" style={{width: '84%'}}></div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#D4A054] font-bold">Linguagens</span>
                          <span className="font-black text-[#D4A054] text-sm">76%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#D4A054] to-[#E4B064] h-2 rounded-full shadow-sm" style={{width: '76%'}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3 text-3xl opacity-80 group-hover:scale-110 transition-transform">📊</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto border-[#D4A054] text-[#D4A054] hover:bg-[#D4A054] hover:text-white transition-all hover:shadow-lg font-semibold"
                    aria-label="Ver detalhes da taxa de retenção por componente"
                  >
                    Ver Detalhes
                  </Button>
              </CardContent>
            </Card>

            {/* LINHA 3 - Últimos 4 cards novos */}
            {/* Alunos Destaque do Mês */}
            <Card className="bg-[var(--background-card)] border-[#FFC23C] border rounded-xl h-[160px] group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[var(--text-secondary)] text-base font-semibold mb-2">Alunos Destaque</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-[#FFC23C] rounded-full flex items-center justify-center text-white font-bold text-xs">J</div>
                        <span className="flex-1 font-medium">João Silva</span>
                        <span className="font-bold text-[#FFC23C] text-xs">1.250</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-[#A6E3E9] rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
                        <span className="flex-1 font-medium">Ana Beatriz</span>
                        <span className="font-bold text-[#A6E3E9] text-xs">1.100</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-[#4DA3A9] rounded-full flex items-center justify-center text-white font-bold text-xs">P</div>
                        <span className="flex-1 font-medium">Pedro M.</span>
                        <span className="font-bold text-[#4DA3A9] text-xs">980</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xl">🏅</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-auto mx-auto border-[#FFC23C] text-[#FFC23C] hover:bg-[#FFC23C] hover:text-white transition-colors"
                  aria-label="Ver detalhes dos alunos destaque do mês"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
              </Card>

              {/* Próximas Atividades Agendadas */}
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 border-[#D4A054] border-2 shadow-lg hover:shadow-2xl transition-all hover:scale-105 h-[140px] group">
                <CardContent className="p-5 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#A6E3E9] bg-opacity-10 rounded-full -mr-8 -mt-8"></div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-[#155e75] font-bold text-sm mb-3 tracking-wide uppercase">
                        Próximas Atividades
                      </h3>
                      <div className="text-5xl font-black text-[#A6E3E9] leading-none mb-1 font-mono">7</div>
                      <div className="text-xs text-cyan-700 font-medium">próximos 7 dias</div>
                    </div>
                    <div className="ml-3 text-3xl opacity-80 group-hover:scale-110 transition-transform">📅</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto border-[#D4A054] text-[#D4A054] hover:bg-[#D4A054] hover:text-white transition-all hover:shadow-lg font-semibold"
                    aria-label="Ver detalhes das próximas atividades agendadas"
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              {/* Alerta de Baixo Engajamento */}
              <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-[#D4A054] border-2 shadow-lg hover:shadow-2xl transition-all hover:scale-105 h-[140px] group">
                <CardContent className="p-5 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#E57373] bg-opacity-10 rounded-full -mr-8 -mt-8"></div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-[#be123c] font-bold text-sm mb-3 tracking-wide uppercase">
                        Baixo Engajamento
                      </h3>
                      <div className="text-5xl font-black text-[#E57373] leading-none mb-1 font-mono">5</div>
                      <div className="text-xs text-red-700 font-medium">sem acesso 14+ dias</div>
                    </div>
                    <div className="ml-3 text-3xl opacity-80 group-hover:scale-110 transition-transform">⚠️</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto border-[#D4A054] text-[#D4A054] hover:bg-[#D4A054] hover:text-white transition-all hover:shadow-lg font-semibold"
                    aria-label="Ver detalhes do alerta de baixo engajamento"
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              {/* Conquistas Coletivas da Turma */}
              <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 border-[#D4A054] border-2 shadow-lg hover:shadow-2xl transition-all hover:scale-105 h-[140px] group">
                <CardContent className="p-5 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFC23C] bg-opacity-20 rounded-full -mr-8 -mt-8"></div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-[#a16207] font-bold text-sm mb-3 tracking-wide uppercase">
                        Conquistas Coletivas
                      </h3>
                      <div className="text-4xl font-black text-[#FFC23C] leading-none mb-1 font-mono">8.540</div>
                      <div className="text-xs text-amber-700 font-medium">XP trimestre atual</div>
                    </div>
                    <div className="ml-3 text-3xl opacity-80 group-hover:scale-110 transition-transform">🎖️</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto border-[#D4A054] text-[#D4A054] hover:bg-[#D4A054] hover:text-white transition-all hover:shadow-lg font-semibold"
                    aria-label="Ver detalhes das conquistas coletivas da turma"
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "engajamento":
        return (
          <div className="space-y-6">
            {/* Tendência de Acesso */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" style={{ color: COLORS.primary }} />
                  Tendência de Acesso (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { dia: "2025-05-01", acessos: 4 },
                    { dia: "2025-05-05", acessos: 8 },
                    { dia: "2025-05-10", acessos: 12 },
                    { dia: "2025-05-15", acessos: 9 },
                    { dia: "2025-05-20", acessos: 14 },
                    { dia: "2025-05-25", acessos: 11 },
                    { dia: "2025-05-30", acessos: 16 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="acessos" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cards de Alunos Ativos e em Risco */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="text-lg">Alunos Ativos (7 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#4DA3A9]">18</div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSelectedDetailModal("alunos-ativos-7d")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="text-lg">Alunos Ativos (30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#4DA3A9]">37</div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSelectedDetailModal("alunos-ativos-30d")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Alunos em Risco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">8</div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSelectedDetailModal("alunos-risco")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "desempenho":
        return (
          <div className="space-y-6">
            {/* Taxa de Conclusão */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader>
                <CardTitle>Taxa de Conclusão de Missões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4DA3A9]">
                      62%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Concluídas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFC23C]">
                      23%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      15%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Não Iniciadas</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedDetailModal("taxa-conclusao")}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            {/* Ranking XP e Progresso por Componente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" style={{ color: COLORS.quaternary }} />
                    Ranking XP (mês) - Top 5
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { nome: "João Silva", xp: 1250 },
                      { nome: "Ana Beatriz", xp: 1100 },
                      { nome: "Pedro Maranhão", xp: 980 },
                      { nome: "Júlia Mendes", xp: 870 },
                      { nome: "Lucas Tavares", xp: 760 }
                    ].map((aluno: any, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#FFC23C] text-white text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-[var(--text-primary)]">{aluno.nome}</span>
                        </div>
                        <span className="font-bold text-[#FFC23C]">{aluno.xp} XP</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedDetailModal("ranking-xp")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle>Progresso Médio por Componente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { componente: "Ciências da Natureza", media: 72 },
                      { componente: "Linguagens e suas Tecnologias", media: 68 },
                      { componente: "Matemática e suas Tecnologias", media: 54 },
                      { componente: "História", media: 47 }
                    ].map((comp: any, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-primary)]">{comp.componente}</span>
                        <span className="font-bold text-[#4DA3A9]">{comp.media}%</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedDetailModal("progresso-componentes")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "relatorios":
        return (
          <div className="space-y-6">
            {/* Evolução Trimestral */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" style={{ color: COLORS.tertiary }} />
                  Evolução Trimestral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { tri: "1º Trimestre", media: 48 },
                    { tri: "2º Trimestre", media: 57 },
                    { tri: "3º Trimestre", media: 63 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tri" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="media" 
                      stroke={COLORS.primary}
                      fill={COLORS.tertiary}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="h-5 w-5" style={{ color: COLORS.secondary }} />
                    Tempo Médio por Missão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#D4A054]">12 min</div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSelectedDetailModal("tempo-medio")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: COLORS.primary }} />
                    Atividades Futuras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4</div>
                  <p className="text-sm text-gray-600">próximos 7 dias</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSelectedDetailModal("atividades-futuras")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5" style={{ color: COLORS.quaternary }} />
                    Conquistas Coletivas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">320 XP</div>
                  <p className="text-sm text-gray-600">24 medalhas</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSelectedDetailModal("conquistas-coletivas")}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Aba não encontrada</div>;
    }
  };

  const renderMainContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Header com título */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                Painel do Professor
              </h1>
              <Button
                onClick={() => {
                  queryClient.invalidateQueries();
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Atualizar Dados
              </Button>
            </div>
            
            {/* Tabs de navegação */}
            <div className="border-b border-[var(--border-card)]">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-card)]'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Conteúdo das abas */}
            {renderTabContent()}
          </div>
        );

      case "turmas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Minhas Turmas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {minhasTurmas?.map((turma: any) => (
                <Card key={turma.id} className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-[var(--border-card)]">
                    <CardTitle className="text-[var(--text-primary)]">{turma.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Série:</strong> {turma.serie}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Ano Letivo:</strong> {turma.ano_letivo}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          turma.ativa ? 'bg-[var(--success)] text-[var(--success-contrast)]' : 'bg-[var(--danger)] text-[var(--danger-contrast)]'
                        }`}>
                          {turma.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )) || <p className="text-[var(--text-secondary)]">Nenhuma turma encontrada</p>}
            </div>
          </div>
        );

      case "componentes":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Meus Componentes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meusComponentes?.map((componente: any) => (
                <Card key={componente.id} className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-[var(--border-card)]">
                    <CardTitle className="text-[var(--text-primary)]">{componente.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Área:</strong> {componente.area}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Carga Horária:</strong> {componente.carga_horaria}h
                      </p>
                      {componente.descricao && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          <strong>Descrição:</strong> {componente.descricao}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) || <p className="text-[var(--text-secondary)]">Nenhum componente encontrado</p>}
            </div>
          </div>
        );

      case "planos":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Planos de Aula</h2>
              <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Plano de Aula</DialogTitle>
                  </DialogHeader>
                  <Form {...planoForm}>
                    <form onSubmit={planoForm.handleSubmit((data) => createPlanoMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={planoForm.control}
                        name="turma_componente_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Componente da Turma</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um componente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vinculos?.map((vinculo: any) => (
                                  <SelectItem key={vinculo.id} value={vinculo.id}>
                                    {vinculo.componente_nome} - {vinculo.turma_nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={planoForm.control}
                        name="trimestre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trimestre</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1º">1º Trimestre</SelectItem>
                                <SelectItem value="2º">2º Trimestre</SelectItem>
                                <SelectItem value="3º">3º Trimestre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={planoForm.control}
                        name="titulo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o título do plano" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={planoForm.control}
                        name="conteudo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conteúdo</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Descreva o conteúdo do plano de aula" rows={6} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPlanoModalOpen(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={createPlanoMutation.isPending}
                          className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]"
                        >
                          {createPlanoMutation.isPending ? "Criando..." : "Criar Plano"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {planosAula?.map((plano: any) => (
                <Card key={plano.id} className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-[var(--border-card)]">
                    <CardTitle className="text-[var(--text-primary)]">{plano.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                        <span><strong>Trimestre:</strong> {plano.trimestre}</span>
                        <span><strong>Componente:</strong> {plano.componente_nome}</span>
                        <span><strong>Turma:</strong> {plano.turma_nome}</span>
                      </div>
                      <p className="text-[var(--text-primary)]">{plano.conteudo}</p>
                    </div>
                  </CardContent>
                </Card>
              )) || <p className="text-[var(--text-secondary)]">Nenhum plano de aula encontrado</p>}
            </div>
          </div>
        );

      case "missoes":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Missões</h2>
              <Dialog open={isMissaoModalOpen} onOpenChange={setIsMissaoModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Missão
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Missão</DialogTitle>
                  </DialogHeader>
                  <Form {...missaoForm}>
                    <form onSubmit={missaoForm.handleSubmit((data) => createMissaoMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={missaoForm.control}
                        name="turma_componente_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Componente da Turma</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um componente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vinculos?.map((vinculo: any) => (
                                  <SelectItem key={vinculo.id} value={vinculo.id}>
                                    {vinculo.componente_nome} - {vinculo.turma_nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={missaoForm.control}
                        name="titulo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o título da missão" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={missaoForm.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Descreva a missão" rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={missaoForm.control}
                          name="dificuldade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dificuldade (1-5)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="5"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={missaoForm.control}
                          name="xp_reward"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recompensa XP</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={missaoForm.control}
                          name="tempo_estimado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tempo (min)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="5"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMissaoModalOpen(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMissaoMutation.isPending}
                          className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]"
                        >
                          {createMissaoMutation.isPending ? "Criando..." : "Criar Missão"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {missoes?.map((missao: any) => (
                <Card key={missao.id} className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-[var(--border-card)]">
                    <CardTitle className="text-[var(--text-primary)] flex items-center justify-between">
                      {missao.titulo}
                      <span className="text-sm font-normal text-[var(--text-secondary)]">
                        XP: {missao.xp_reward}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                        <span><strong>Componente:</strong> {missao.componente_nome}</span>
                        <span><strong>Turma:</strong> {missao.turma_nome}</span>
                        <span><strong>Dificuldade:</strong> {missao.dificuldade}/5</span>
                        <span><strong>Tempo:</strong> {missao.tempo_estimado}min</span>
                      </div>
                      <p className="text-[var(--text-primary)]">{missao.descricao}</p>
                    </div>
                  </CardContent>
                </Card>
              )) || <p className="text-[var(--text-secondary)]">Nenhuma missão encontrada</p>}
            </div>
          </div>
        );

      case "alunos":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Meus Alunos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meusAlunos?.map((aluno: any) => (
                <Card key={aluno.id} className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-[var(--border-card)]">
                    <CardTitle className="text-[var(--text-primary)]">{aluno.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Email:</strong> {aluno.email}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Turma:</strong> {aluno.turma_nome}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          aluno.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {aluno.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )) || <p className="text-[var(--text-secondary)]">Nenhum aluno encontrado</p>}
            </div>
          </div>
        );

      default:
        return <div>Conteúdo não encontrado</div>;
    }
  };

  // Modal de configurações
  const SettingsModal = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-900">{user?.nome}</h3>
            <p className="text-sm text-amber-600">{user?.email}</p>
            <p className="text-xs text-amber-500 mt-1">Professor</p>
          </div>
          
          <div className="border-t pt-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {/* Implementar edição de perfil */}}
              >
                <User className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {/* Implementar alteração de senha */}}
              >
                <Shield className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sabia-bg">
      <Sidebar />
      
      {/* Overlay para mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Conteúdo principal */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header />
        
        <main className="p-6">
          {renderMainContent()}
        </main>
      </div>

      <SettingsModal />
    </div>
  );
}