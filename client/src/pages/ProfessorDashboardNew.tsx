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
  X
} from "lucide-react";

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

  // Estado da interface
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isMissaoModalOpen, setIsMissaoModalOpen] = useState(false);

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
      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Turmas</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{minhasTurmas?.length || 0}</p>
            </div>
            <Users className="h-8 w-8 text-[var(--accent)]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Componentes</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{meusComponentes?.length || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-[var(--accent)]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Planos de Aula</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{planosAula?.length || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-[var(--accent)]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Alunos</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{meusAlunos?.length || 0}</p>
            </div>
            <Award className="h-8 w-8 text-[var(--accent)]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Conteúdo principal baseado no menu ativo
  const renderMainContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Últimos planos de aula */}
              <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b border-[var(--border-card)]">
                  <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Últimos Planos de Aula
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {planosAula?.slice(0, 3).map((plano: any) => (
                    <div key={plano.id} className="flex items-center justify-between py-3 border-b border-[var(--border-card)] last:border-0">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{plano.titulo}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{plano.trimestre} - {plano.componente_nome}</p>
                      </div>
                      <Clock className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                  )) || <p className="text-[var(--text-secondary)]">Nenhum plano de aula encontrado</p>}
                </CardContent>
              </Card>

              {/* Missões ativas */}
              <Card className="bg-[var(--background-card)] border-[var(--border-card)] shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="border-b border-[var(--border-card)]">
                  <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Missões Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {missoes?.slice(0, 3).map((missao: any) => (
                    <div key={missao.id} className="flex items-center justify-between py-3 border-b border-[var(--border-card)] last:border-0">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{missao.titulo}</p>
                        <p className="text-sm text-[var(--text-secondary)]">XP: {missao.xp_reward} • {missao.tempo_estimado}min</p>
                      </div>
                      <Target className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                  )) || <p className="text-[var(--text-secondary)]">Nenhuma missão encontrada</p>}
                </CardContent>
              </Card>
            </div>
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