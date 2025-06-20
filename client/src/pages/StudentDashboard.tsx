import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Star, 
  Clock, 
  ChevronRight, 
  History,
  Settings,
  LogOut,
  User,
  Award,
  Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Schema para avaliação diagnóstica
const avaliacaoSchema = z.object({
  respostas: z.record(z.string(), z.string()).refine(
    (respostas) => Object.keys(respostas).length >= 10,
    { message: "Responda todas as perguntas" }
  )
});

type AvaliacaoForm = z.infer<typeof avaliacaoSchema>;

// Tipos para o sistema do aluno
interface StudentData {
  id: string;
  nome: string;
  email: string;
  escola_id: string;
  turma_id: string;
  ano_serie: string;
  escola_nome: string;
  turma_nome: string;
  xp_total: number;
  nivel: number;
  ultima_triagem: string | null;
}

interface ProgressoAluno {
  id: string;
  tipo: 'triagem' | 'missao' | 'trilha';
  data_avaliacao: string;
  respostas: any;
  nivel_detectado: number;
  areas_fortes: string[];
  areas_fracas: string[];
}

interface Trilha {
  id: string;
  titulo: string;
  descricao: string;
  disciplina: string;
  nivel: number;
  progresso: number;
  missoes_total: number;
  missoes_concluidas: number;
}

interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  area: string;
  dificuldade: number;
  xp_reward: number;
  tempo_estimado: number;
  status: 'pendente' | 'em_andamento' | 'concluida';
  conteudo: any;
}

interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  data_conquista?: string;
  desbloqueada: boolean;
}

interface Ranking {
  posicao: number;
  total_alunos: number;
  xp_total: number;
  nivel: number;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [showSettings, setShowSettings] = useState(false);
  const [showTriagem, setShowTriagem] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  // Formulário de avaliação diagnóstica
  const avaliacaoForm = useForm<AvaliacaoForm>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: { respostas: {} }
  });

  // Query para dados do aluno
  const { data: studentData, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["/api/aluno/dados"],
    enabled: !!user
  });

  // Query para verificar necessidade de triagem
  const { data: needsTriagem } = useQuery({
    queryKey: ["/api/aluno/needs-triagem"],
    enabled: !!studentData
  });

  // Query para trilhas personalizadas
  const { data: trilhas, isLoading: isLoadingTrilhas } = useQuery({
    queryKey: ["/api/aluno/trilhas"],
    enabled: !!studentData && !needsTriagem
  });

  // Query para missões ativas
  const { data: missoes, isLoading: isLoadingMissoes } = useQuery({
    queryKey: ["/api/aluno/missoes"],
    enabled: !!studentData && !needsTriagem
  });

  // Query para conquistas
  const { data: conquistas } = useQuery({
    queryKey: ["/api/aluno/conquistas"],
    enabled: !!studentData
  });

  // Query para ranking
  const { data: ranking } = useQuery({
    queryKey: ["/api/aluno/ranking"],
    enabled: !!studentData
  });

  // Query para histórico de progresso
  const { data: historico } = useQuery({
    queryKey: ["/api/aluno/historico"],
    enabled: showHistorico
  });

  // Mutation para submeter avaliação diagnóstica
  const submitTriagemMutation = useMutation({
    mutationFn: (data: AvaliacaoForm) => apiRequest("/api/aluno/triagem", "POST", data),
    onSuccess: () => {
      setShowTriagem(false);
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/needs-triagem"] });
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/trilhas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/missoes"] });
    }
  });

  // Mutation para iniciar missão
  const iniciarMissaoMutation = useMutation({
    mutationFn: (missaoId: string) => apiRequest("/api/aluno/missoes/iniciar", "POST", { missaoId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/missoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/dados"] });
    }
  });

  // Mutation para completar missão
  const completarMissaoMutation = useMutation({
    mutationFn: ({ missaoId, resposta }: { missaoId: string; resposta: any }) => 
      apiRequest("/api/aluno/missoes/completar", "POST", { missaoId, resposta }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/missoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/dados"] });
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/ranking"] });
      queryClient.invalidateQueries({ queryKey: ["/api/aluno/conquistas"] });
    }
  });

  // Redirecionamento para triagem temporariamente desabilitado
  // useEffect(() => {
  //   if (needsTriagem && !showTriagem) {
  //     setShowTriagem(true);
  //   }
  // }, [needsTriagem, showTriagem]);

  // Verificar se aluno tem escola/turma
  useEffect(() => {
    if (studentData && (!studentData.escola_id || !studentData.turma_id)) {
      // Exibir erro e impedir acesso
      alert("Aluno sem turma/escola cadastrada. Entre em contato com a coordenação.");
      logout();
    }
  }, [studentData, logout]);

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Card className="bg-[var(--background-card)] border-[var(--border-card)] p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Erro de Acesso</h2>
            <p className="text-[var(--text-secondary)]">Não foi possível carregar seus dados. Tente novamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nivelAtual = Math.floor(studentData.xp_total / 1000) + 1;
  const xpProximoNivel = ((nivelAtual) * 1000) - studentData.xp_total;
  const progressoNivel = ((studentData.xp_total % 1000) / 1000) * 100;

  const renderContent = () => {
    switch (activeTab) {
      case "visao-geral":
        return (
          <div className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Nível Atual</CardTitle>
                  <Star className="h-4 w-4 text-[var(--primary)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{nivelAtual}</div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {xpProximoNivel} XP para próximo nível
                  </p>
                  <Progress value={progressoNivel} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">XP Total</CardTitle>
                  <Zap className="h-4 w-4 text-[var(--primary)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{studentData.xp_total.toLocaleString()}</div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Experiência acumulada
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Ranking</CardTitle>
                  <Trophy className="h-4 w-4 text-[var(--primary)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    #{ranking?.posicao || '-'}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    de {ranking?.total_alunos || 0} alunos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Conquistas</CardTitle>
                  <Award className="h-4 w-4 text-[var(--primary)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {conquistas?.filter((c: Conquista) => c.desbloqueada).length || 0}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    de {conquistas?.length || 0} disponíveis
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Missões em destaque */}
            <Card className="bg-[var(--background-card)] border-[var(--border-card)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Missões Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingMissoes ? (
                    <p className="text-[var(--text-secondary)]">Carregando missões...</p>
                  ) : missoes?.slice(0, 3).map((missao: Missao) => (
                    <div key={missao.id} className="flex items-center justify-between p-4 border border-[var(--border-card)] rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--text-primary)]">{missao.titulo}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{missao.descricao}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{missao.area}</Badge>
                          <Badge variant="outline">{missao.xp_reward} XP</Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {missao.tempo_estimado}min
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (missao.status === 'pendente') {
                            iniciarMissaoMutation.mutate(missao.id);
                          }
                        }}
                        disabled={iniciarMissaoMutation.isPending}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]"
                      >
                        {missao.status === 'pendente' ? 'Iniciar' : 
                         missao.status === 'em_andamento' ? 'Continuar' : 'Concluída'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "trilhas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Trilhas de Aprendizagem</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingTrilhas ? (
                <p className="text-[var(--text-secondary)]">Carregando trilhas...</p>
              ) : trilhas?.map((trilha: Trilha) => (
                <Card key={trilha.id} className="bg-[var(--background-card)] border-[var(--border-card)] hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-[var(--text-primary)]">{trilha.titulo}</CardTitle>
                    <p className="text-sm text-[var(--text-secondary)]">{trilha.descricao}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Progresso</span>
                        <span className="text-[var(--text-primary)] font-medium">
                          {trilha.missoes_concluidas}/{trilha.missoes_total}
                        </span>
                      </div>
                      <Progress value={trilha.progresso} />
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{trilha.disciplina}</Badge>
                        <Badge variant="outline">Nível {trilha.nivel}</Badge>
                      </div>
                      <Button 
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]"
                        onClick={() => setActiveTab("missoes")}
                      >
                        Ver Missões
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "missoes":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Missões</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {isLoadingMissoes ? (
                <p className="text-[var(--text-secondary)]">Carregando missões...</p>
              ) : missoes?.map((missao: Missao) => (
                <Card key={missao.id} className="bg-[var(--background-card)] border-[var(--border-card)]">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-[var(--text-primary)]">{missao.titulo}</CardTitle>
                        <p className="text-[var(--text-secondary)] mt-2">{missao.descricao}</p>
                      </div>
                      <Badge 
                        variant={missao.status === 'concluida' ? 'default' : 'outline'}
                        className={missao.status === 'concluida' ? 'bg-green-500' : ''}
                      >
                        {missao.status === 'pendente' ? 'Pendente' :
                         missao.status === 'em_andamento' ? 'Em Andamento' : 'Concluída'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">{missao.area}</Badge>
                      <Badge variant="outline">Dificuldade: {missao.dificuldade}/5</Badge>
                      <Badge variant="outline">{missao.xp_reward} XP</Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {missao.tempo_estimado}min
                      </Badge>
                    </div>
                    
                    {missao.status !== 'concluida' && (
                      <Button
                        onClick={() => {
                          if (missao.status === 'pendente') {
                            iniciarMissaoMutation.mutate(missao.id);
                          }
                        }}
                        disabled={iniciarMissaoMutation.isPending}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]"
                      >
                        {missao.status === 'pendente' ? 'Iniciar Missão' : 'Continuar Missão'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "conquistas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Conquistas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conquistas?.map((conquista: Conquista) => (
                <Card 
                  key={conquista.id} 
                  className={`bg-[var(--background-card)] border-[var(--border-card)] ${
                    conquista.desbloqueada ? 'ring-2 ring-[var(--primary)]' : 'opacity-60'
                  }`}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{conquista.icone}</div>
                    <CardTitle className={`text-[var(--text-primary)] ${!conquista.desbloqueada && 'opacity-60'}`}>
                      {conquista.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-[var(--text-secondary)]">{conquista.descricao}</p>
                    {conquista.desbloqueada && conquista.data_conquista && (
                      <p className="text-xs text-[var(--text-secondary)] mt-2">
                        Conquistado em {new Date(conquista.data_conquista).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Conteúdo não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background-card)] border-b border-[var(--border-card)] px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">SABIÁ RPG</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {studentData.nome} - {studentData.turma_nome} | {studentData.escola_nome}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowHistorico(true)}
              className="border-[var(--border-card)]"
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
            
            {/* Botão de refazer triagem - só aparece se já passaram 90 dias */}
            {studentData.ultima_triagem && 
             (Date.now() - new Date(studentData.ultima_triagem).getTime()) > (90 * 24 * 60 * 60 * 1000) && (
              <Button
                variant="outline"
                onClick={() => setShowTriagem(true)}
                className="border-[var(--border-card)]"
              >
                <Target className="h-4 w-4 mr-2" />
                Refazer Triagem
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="border-[var(--border-card)]"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={logout}
              className="border-[var(--border-card)]"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[var(--background-card)] border-b border-[var(--border-card)] px-6 py-3">
        <div className="flex space-x-6">
          {[
            { id: "visao-geral", label: "Visão Geral", icon: BookOpen },
            { id: "trilhas", label: "Trilhas", icon: Target },
            { id: "missoes", label: "Missões", icon: Trophy },
            { id: "conquistas", label: "Conquistas", icon: Award }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>

      {/* Modal de Triagem Diagnóstica */}
      <Dialog open={showTriagem} onOpenChange={setShowTriagem}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Avaliação Diagnóstica</DialogTitle>
          </DialogHeader>
          <Form {...avaliacaoForm}>
            <form onSubmit={avaliacaoForm.handleSubmit((data) => submitTriagemMutation.mutate(data))}>
              <div className="space-y-6">
                <p className="text-[var(--text-secondary)]">
                  Esta avaliação nos ajuda a personalizar sua experiência de aprendizagem. 
                  Responda com sinceridade para obter as melhores recomendações.
                </p>
                
                {/* Perguntas de avaliação diagnóstica */}
                {Array.from({ length: 10 }, (_, i) => (
                  <FormField
                    key={i}
                    control={avaliacaoForm.control}
                    name={`respostas.pergunta_${i + 1}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Pergunta {i + 1}: {getTriagemQuestion(i + 1)}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            {getTriagemOptions(i + 1).map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`q${i + 1}_${idx}`} />
                                <Label htmlFor={`q${i + 1}_${idx}`}>{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={submitTriagemMutation.isPending}
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-contrast)]"
                  >
                    {submitTriagemMutation.isPending ? "Processando..." : "Finalizar Avaliação"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico */}
      <Dialog open={showHistorico} onOpenChange={setShowHistorico}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Progresso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {historico?.map((item: ProgressoAluno) => (
              <Card key={item.id} className="bg-[var(--background-card)] border-[var(--border-card)]">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)]">
                        {item.tipo === 'triagem' ? 'Avaliação Diagnóstica' : 
                         item.tipo === 'missao' ? 'Missão Concluída' : 'Trilha Iniciada'}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {new Date(item.data_avaliacao).toLocaleDateString()}
                      </p>
                      {item.nivel_detectado && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          Nível detectado: {item.nivel_detectado}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">{item.tipo}</Badge>
                  </div>
                  {item.areas_fortes && item.areas_fortes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">Áreas fortes:</p>
                      <div className="flex gap-1 mt-1">
                        {item.areas_fortes.map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border border-[var(--border-card)] rounded-lg">
              <User className="h-5 w-5 text-[var(--text-secondary)]" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">{studentData.nome}</p>
                <p className="text-sm text-[var(--text-secondary)]">{studentData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border border-[var(--border-card)] rounded-lg">
              <BookOpen className="h-5 w-5 text-[var(--text-secondary)]" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Turma</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {studentData.turma_nome} - {studentData.ano_serie}
                </p>
              </div>
            </div>
            
            <Button
              onClick={logout}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Funções auxiliares para triagem diagnóstica
function getTriagemQuestion(num: number): string {
  const perguntas = [
    "Como você se sente em relação à matemática?",
    "Qual sua facilidade com leitura e interpretação de textos?",
    "Como você avalia seu conhecimento em ciências?",
    "Qual seu interesse por história?",
    "Como você se sente estudando geografia?",
    "Qual sua afinidade com artes?",
    "Como você prefere aprender conteúdos novos?",
    "Qual seu tempo preferido de estudo?",
    "Como você lida com desafios difíceis?",
    "Qual tipo de atividade mais te motiva?"
  ];
  return perguntas[num - 1] || "";
}

function getTriagemOptions(num: number): Array<{ value: string; label: string }> {
  const opcoes = [
    [
      { value: "muito_facil", label: "Muito fácil - Adoro matemática" },
      { value: "facil", label: "Fácil - Gosto de matemática" },
      { value: "medio", label: "Médio - É ok" },
      { value: "dificil", label: "Difícil - Tenho dificuldades" },
      { value: "muito_dificil", label: "Muito difícil - Não gosto" }
    ],
    [
      { value: "excelente", label: "Excelente - Leio muito bem" },
      { value: "boa", label: "Boa - Leio bem" },
      { value: "regular", label: "Regular - Leio razoavelmente" },
      { value: "dificil", label: "Com dificuldade" },
      { value: "muito_dificil", label: "Muita dificuldade" }
    ],
    [
      { value: "muito_bom", label: "Muito bom - Adoro ciências" },
      { value: "bom", label: "Bom - Gosto de ciências" },
      { value: "regular", label: "Regular - É interessante" },
      { value: "pouco", label: "Pouco - Tenho dificuldades" },
      { value: "nenhum", label: "Nenhum - Não gosto" }
    ]
  ];
  
  // Para as outras perguntas, usar padrão similar
  if (num <= 3) return opcoes[num - 1];
  
  return [
    { value: "muito_alto", label: "Muito alto" },
    { value: "alto", label: "Alto" },
    { value: "medio", label: "Médio" },
    { value: "baixo", label: "Baixo" },
    { value: "muito_baixo", label: "Muito baixo" }
  ];
}