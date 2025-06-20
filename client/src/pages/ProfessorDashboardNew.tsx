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
  Calendar
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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado da interface
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isMissaoModalOpen, setIsMissaoModalOpen] = useState(false);

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

  // Mutations
  const createPlanoMutation = useMutation({
    mutationFn: (data: PlanoAulaForm) => 
      apiRequest('POST', '/api/professor/planos-aula', data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Plano de aula criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professor/planos-aula'] });
      setIsPlanoModalOpen(false);
      planoForm.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar plano de aula",
        variant: "destructive",
      });
    }
  });

  const createMissaoMutation = useMutation({
    mutationFn: (data: MissaoForm) => 
      apiRequest('POST', '/api/professor/missoes', data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Missão criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professor/missoes'] });
      setIsMissaoModalOpen(false);
      missaoForm.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar missão",
        variant: "destructive",
      });
    }
  });

  const onSubmitPlano = (data: PlanoAulaForm) => {
    createPlanoMutation.mutate(data);
  };

  const onSubmitMissao = (data: MissaoForm) => {
    createMissaoMutation.mutate(data);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
  };

  if (!user) {
    return null;
  }

  const renderMainContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="sabia-card-bg border-accent shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-parchment">Minhas Turmas</CardTitle>
                  <Users className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{Array.isArray(minhasTurmas) ? minhasTurmas.length : 0}</div>
                  <p className="text-xs text-muted-foreground">turmas ativas</p>
                </CardContent>
              </Card>

              <Card className="sabia-card-bg border-accent shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-parchment">Componentes</CardTitle>
                  <BookOpen className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{Array.isArray(meusComponentes) ? meusComponentes.length : 0}</div>
                  <p className="text-xs text-muted-foreground">disciplinas</p>
                </CardContent>
              </Card>

              <Card className="sabia-card-bg border-accent shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-parchment">Planos de Aula</CardTitle>
                  <FileText className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{Array.isArray(planosAula) ? planosAula.length : 0}</div>
                  <p className="text-xs text-muted-foreground">planos criados</p>
                </CardContent>
              </Card>

              <Card className="sabia-card-bg border-accent shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-parchment">Meus Alunos</CardTitle>
                  <Award className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{Array.isArray(meusAlunos) ? meusAlunos.length : 0}</div>
                  <p className="text-xs text-muted-foreground">alunos ativos</p>
                </CardContent>
              </Card>
            </div>

            {/* Seções Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="sabia-card-bg border-accent">
                <CardHeader>
                  <CardTitle className="text-parchment flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Minhas Turmas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(minhasTurmas) && minhasTurmas.length > 0 ? (
                      minhasTurmas.map((turma: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#3a3730] border border-accent/20">
                          <div>
                            <p className="font-medium text-parchment">{turma.nome || `Turma ${index + 1}`}</p>
                            <p className="text-sm text-muted-foreground">{turma.serie || 'Série não informada'}</p>
                          </div>
                          <span className="px-2 py-1 bg-accent text-dark-wood rounded text-xs font-medium">
                            Ativa
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma turma encontrada</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="sabia-card-bg border-accent">
                <CardHeader>
                  <CardTitle className="text-parchment flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-accent" />
                    Meus Componentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(meusComponentes) && meusComponentes.length > 0 ? (
                      meusComponentes.map((componente: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#3a3730] border border-accent/20">
                          <div>
                            <p className="font-medium text-parchment">{componente.nome || `Componente ${index + 1}`}</p>
                            <p className="text-sm text-muted-foreground">{componente.turma_nome || 'Turma não informada'}</p>
                          </div>
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-accent"
                            style={{ backgroundColor: componente.cor_hex || '#d4af37' }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum componente encontrado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-parchment mb-4">Seção em Desenvolvimento</h2>
            <p className="text-muted-foreground">Esta funcionalidade será implementada em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="sabia-bg flex flex-col">
      <div className="sabia-decorative-corner top-left"></div>
      <div className="sabia-decorative-corner top-right"></div>
      <div className="sabia-decorative-corner bottom-left"></div>
      <div className="sabia-decorative-corner bottom-right"></div>
      
      {/* Top Navigation Bar */}
      <header className="bg-[#312e26] border-b border-accent shadow-lg z-10">
        <div className="h-16 px-4 flex items-center justify-between relative">
          {/* Menu Button com Título */}
          <div className="flex items-center gap-3">
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
              {sidebarOpen ? <ArrowLeftFromLine size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-parchment font-cinzel font-bold text-sm tracking-wide">
              PAINEL DO <span className="text-accent">PROFESSOR</span>
            </span>
          </div>

          {/* Logo Centralizada */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <img 
              src="/attached_assets/LOGOSABIA_1750308592736.png" 
              alt="Sabiá RPG" 
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-xl font-cinzel font-bold text-parchment tracking-wide">
              SABIÁ<span className="text-accent">RPG</span>
            </h1>
          </div>
          
          {/* Ações Rápidas */}
          <div className="flex items-center gap-3">
            <Dialog open={isMissaoModalOpen} onOpenChange={setIsMissaoModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent-foreground text-dark-wood border border-accent">
                  <Brain className="w-4 h-4 mr-2" />
                  Criar Missão IA
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6b5b47] hover:bg-[#7d6954] text-parchment border border-accent">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-[#2a251e] border-r border-accent transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'} transition-all duration-300 ease-in-out`}>
          <nav className="h-full px-3 py-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleMenuSelect("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeMenu === "dashboard" 
                      ? "bg-accent text-dark-wood font-semibold" 
                      : "text-parchment hover:bg-[#3a3730] hover:text-accent"
                  }`}
                >
                  <Home size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>Visão Geral</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuSelect("turmas")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeMenu === "turmas" 
                      ? "bg-accent text-dark-wood font-semibold" 
                      : "text-parchment hover:bg-[#3a3730] hover:text-accent"
                  }`}
                >
                  <Users size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>Minhas Turmas</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuSelect("componentes")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeMenu === "componentes" 
                      ? "bg-accent text-dark-wood font-semibold" 
                      : "text-parchment hover:bg-[#3a3730] hover:text-accent"
                  }`}
                >
                  <BookOpen size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>Componentes</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuSelect("planos")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeMenu === "planos" 
                      ? "bg-accent text-dark-wood font-semibold" 
                      : "text-parchment hover:bg-[#3a3730] hover:text-accent"
                  }`}
                >
                  <FileText size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>Planos de Aula</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuSelect("missoes")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeMenu === "missoes" 
                      ? "bg-accent text-dark-wood font-semibold" 
                      : "text-parchment hover:bg-[#3a3730] hover:text-accent"
                  }`}
                >
                  <Brain size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>Missões & IA</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuSelect("alunos")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeMenu === "alunos" 
                      ? "bg-accent text-dark-wood font-semibold" 
                      : "text-parchment hover:bg-[#3a3730] hover:text-accent"
                  }`}
                >
                  <Award size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>Meus Alunos</span>}
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-[#1a1611] min-h-screen">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
        <DialogContent className="sabia-card-bg border-accent">
          <DialogHeader>
            <DialogTitle className="text-parchment">Novo Plano de Aula</DialogTitle>
          </DialogHeader>
          <Form {...planoForm}>
            <form onSubmit={planoForm.handleSubmit(onSubmitPlano)} className="space-y-4">
              <FormField
                control={planoForm.control}
                name="turma_componente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Componente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#3a3730] border-accent text-parchment">
                          <SelectValue placeholder="Selecione um componente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2a251e] border-accent">
                        {Array.isArray(meusComponentes) && meusComponentes.map((componente: any) => (
                          <SelectItem key={componente.id} value={componente.id}>
                            {componente.nome}
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
                    <FormLabel className="text-parchment">Trimestre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#3a3730] border-accent text-parchment">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2a251e] border-accent">
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
                    <FormLabel className="text-parchment">Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o título do plano de aula" 
                        {...field} 
                        className="bg-[#3a3730] border-accent text-parchment"
                      />
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
                    <FormLabel className="text-parchment">Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o conteúdo do plano de aula" 
                        rows={4}
                        {...field} 
                        className="bg-[#3a3730] border-accent text-parchment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPlanoModalOpen(false)}
                  className="border-accent text-parchment hover:bg-[#3a3730]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent text-dark-wood hover:bg-accent-foreground"
                  disabled={createPlanoMutation.isPending}
                >
                  {createPlanoMutation.isPending ? "Criando..." : "Criar Plano"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isMissaoModalOpen} onOpenChange={setIsMissaoModalOpen}>
        <DialogContent className="sabia-card-bg border-accent">
          <DialogHeader>
            <DialogTitle className="text-parchment">Nova Missão</DialogTitle>
          </DialogHeader>
          <Form {...missaoForm}>
            <form onSubmit={missaoForm.handleSubmit(onSubmitMissao)} className="space-y-4">
              <FormField
                control={missaoForm.control}
                name="turma_componente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Componente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#3a3730] border-accent text-parchment">
                          <SelectValue placeholder="Selecione um componente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2a251e] border-accent">
                        {Array.isArray(meusComponentes) && meusComponentes.map((componente: any) => (
                          <SelectItem key={componente.id} value={componente.id}>
                            {componente.nome}
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
                    <FormLabel className="text-parchment">Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o título da missão" 
                        {...field} 
                        className="bg-[#3a3730] border-accent text-parchment"
                      />
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
                    <FormLabel className="text-parchment">Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva a missão" 
                        rows={3}
                        {...field} 
                        className="bg-[#3a3730] border-accent text-parchment"
                      />
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
                      <FormLabel className="text-parchment">Dificuldade</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="bg-[#3a3730] border-accent text-parchment"
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
                      <FormLabel className="text-parchment">XP Recompensa</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="bg-[#3a3730] border-accent text-parchment"
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
                      <FormLabel className="text-parchment">Tempo (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="5" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="bg-[#3a3730] border-accent text-parchment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsMissaoModalOpen(false)}
                  className="border-accent text-parchment hover:bg-[#3a3730]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent text-dark-wood hover:bg-accent-foreground"
                  disabled={createMissaoMutation.isPending}
                >
                  {createMissaoMutation.isPending ? "Criando..." : "Criar Missão"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}