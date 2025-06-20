import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Plus, 
  Settings,
  Brain,
  Target,
  Award,
  Clock,
  Edit,
  Eye,
  Trash2
} from "lucide-react";

// Schema para plano de aula
const planoAulaSchema = z.object({
  turma_componente_id: z.string().min(1, "Selecione um componente"),
  trimestre: z.enum(["1º", "2º", "3º"]),
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório")
});

type PlanoAulaForm = z.infer<typeof planoAulaSchema>;

// Schema para missão
const missaoSchema = z.object({
  turma_componente_id: z.string().min(1, "Selecione um componente"),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dificuldade: z.number().min(1).max(5),
  xp_reward: z.number().min(1),
  tempo_estimado: z.number().min(5)
});

type MissaoForm = z.infer<typeof missaoSchema>;

export default function ProfessorDashboard() {
  const { toast } = useToast();
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isMissaoModalOpen, setIsMissaoModalOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<any>(null);
  const [selectedMissao, setSelectedMissao] = useState<any>(null);

  // Queries
  const { data: minhasTurmas = [], isLoading: isLoadingTurmas } = useQuery({
    queryKey: ['/api/professor/minhas-turmas']
  });

  const { data: meusComponentes = [], isLoading: isLoadingComponentes } = useQuery({
    queryKey: ['/api/professor/meus-componentes']
  });

  const { data: planosAula = [], isLoading: isLoadingPlanos } = useQuery({
    queryKey: ['/api/professor/planos-aula']
  });

  const { data: missoes = [], isLoading: isLoadingMissoes } = useQuery({
    queryKey: ['/api/professor/missoes']
  });

  const { data: meusAlunos = [], isLoading: isLoadingAlunos } = useQuery({
    queryKey: ['/api/professor/meus-alunos']
  });

  // Forms
  const planoForm = useForm<PlanoAulaForm>({
    resolver: zodResolver(planoAulaSchema),
    defaultValues: {
      turma_componente_id: "",
      trimestre: "1º",
      titulo: "",
      conteudo: ""
    }
  });

  const missaoForm = useForm<MissaoForm>({
    resolver: zodResolver(missaoSchema),
    defaultValues: {
      turma_componente_id: "",
      titulo: "",
      descricao: "",
      dificuldade: 1,
      xp_reward: 10,
      tempo_estimado: 30
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1810] via-[#1a0f08] to-[#0d0704] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#f4e4bc]">Painel do Professor</h1>
            <p className="text-[#d4a054] mt-1">Gerencie suas turmas, componentes e atividades</p>
          </div>
          
          {/* Ações Rápidas */}
          <div className="flex gap-3">
            <Dialog open={isMissaoModalOpen} onOpenChange={setIsMissaoModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#8b4513] hover:bg-[#a0522d] text-white">
                  <Brain className="w-4 h-4 mr-2" />
                  Criar Missão IA
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4da3a9] hover:bg-[#3d8a8f] text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Plano de Aula
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Cards de Visão Geral */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Minhas Turmas */}
          <Card className="bg-[#43341c] border-[#d4a054]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#f4e4bc]">Minhas Turmas</CardTitle>
              <Users className="h-4 w-4 text-[#d4a054]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#f4e4bc]">{minhasTurmas.length}</div>
              <p className="text-xs text-[#d4a054]">turmas ativas</p>
            </CardContent>
          </Card>

          {/* Meus Componentes */}
          <Card className="bg-[#43341c] border-[#d4a054]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#f4e4bc]">Meus Componentes</CardTitle>
              <BookOpen className="h-4 w-4 text-[#d4a054]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#f4e4bc]">{meusComponentes.length}</div>
              <p className="text-xs text-[#d4a054]">disciplinas</p>
            </CardContent>
          </Card>

          {/* Planos de Aula */}
          <Card className="bg-[#43341c] border-[#d4a054]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#f4e4bc]">Planos de Aula</CardTitle>
              <FileText className="h-4 w-4 text-[#d4a054]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#f4e4bc]">{planosAula.length}</div>
              <p className="text-xs text-[#d4a054]">planos criados</p>
            </CardContent>
          </Card>

          {/* Meus Alunos */}
          <Card className="bg-[#43341c] border-[#d4a054]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#f4e4bc]">Meus Alunos</CardTitle>
              <Award className="h-4 w-4 text-[#d4a054]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#f4e4bc]">{meusAlunos.length}</div>
              <p className="text-xs text-[#d4a054]">alunos ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal em Abas */}
        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#43341c]">
            <TabsTrigger value="visao-geral" className="text-[#f4e4bc] data-[state=active]:bg-[#d4a054] data-[state=active]:text-[#2d1810]">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="planos" className="text-[#f4e4bc] data-[state=active]:bg-[#d4a054] data-[state=active]:text-[#2d1810]">
              Planos de Aula
            </TabsTrigger>
            <TabsTrigger value="missoes" className="text-[#f4e4bc] data-[state=active]:bg-[#d4a054] data-[state=active]:text-[#2d1810]">
              Missões & IA
            </TabsTrigger>
            <TabsTrigger value="alunos" className="text-[#f4e4bc] data-[state=active]:bg-[#d4a054] data-[state=active]:text-[#2d1810]">
              Meus Alunos
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-[#f4e4bc] data-[state=active]:bg-[#d4a054] data-[state=active]:text-[#2d1810]">
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Aba Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Minhas Turmas Detalhado */}
              <Card className="bg-[#43341c] border-[#d4a054]">
                <CardHeader>
                  <CardTitle className="text-[#f4e4bc] flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Minhas Turmas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {minhasTurmas.map((turma: any) => (
                      <div key={turma.id} className="flex items-center justify-between p-3 border-b border-[#d4a054]/20">
                        <div>
                          <p className="font-medium text-[#f4e4bc]">{turma.nome}</p>
                          <p className="text-sm text-[#d4a054]">{turma.serie} - {turma.turno}</p>
                        </div>
                        <Badge variant="secondary" className="bg-[#d4a054] text-[#2d1810]">
                          {turma.total_alunos || 0} alunos
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Meus Componentes Detalhado */}
              <Card className="bg-[#43341c] border-[#d4a054]">
                <CardHeader>
                  <CardTitle className="text-[#f4e4bc] flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Meus Componentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {meusComponentes.map((componente: any) => (
                      <div key={componente.id} className="flex items-center justify-between p-3 border-b border-[#d4a054]/20">
                        <div>
                          <p className="font-medium text-[#f4e4bc]">{componente.nome}</p>
                          <p className="text-sm text-[#d4a054]">{componente.turma_nome}</p>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: componente.cor_hex }}
                        />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Planos de Aula */}
          <TabsContent value="planos" className="space-y-6">
            <Card className="bg-[#43341c] border-[#d4a054]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#f4e4bc]">Planos de Aula Trimestrais</CardTitle>
                  <Button 
                    onClick={() => setIsPlanoModalOpen(true)}
                    className="bg-[#4da3a9] hover:bg-[#3d8a8f] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#d4a054]/20">
                      <TableHead className="text-[#f4e4bc]">Título</TableHead>
                      <TableHead className="text-[#f4e4bc]">Componente</TableHead>
                      <TableHead className="text-[#f4e4bc]">Trimestre</TableHead>
                      <TableHead className="text-[#f4e4bc]">Criado em</TableHead>
                      <TableHead className="text-[#f4e4bc]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planosAula.map((plano: any) => (
                      <TableRow key={plano.id} className="border-[#d4a054]/20">
                        <TableCell className="text-[#f4e4bc] font-medium">{plano.titulo}</TableCell>
                        <TableCell className="text-[#d4a054]">{plano.componente_nome}</TableCell>
                        <TableCell className="text-[#d4a054]">{plano.trimestre}</TableCell>
                        <TableCell className="text-[#d4a054]">
                          {new Date(plano.criado_em).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-[#4da3a9] hover:bg-[#4da3a9]/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#d4a054] hover:bg-[#d4a054]/10">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Missões & IA */}
          <TabsContent value="missoes" className="space-y-6">
            <Card className="bg-[#43341c] border-[#d4a054]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#f4e4bc] flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Missões & Trilhas IA
                  </CardTitle>
                  <Button 
                    onClick={() => setIsMissaoModalOpen(true)}
                    className="bg-[#8b4513] hover:bg-[#a0522d] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Missão IA
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#d4a054]/20">
                      <TableHead className="text-[#f4e4bc]">Título</TableHead>
                      <TableHead className="text-[#f4e4bc]">Componente</TableHead>
                      <TableHead className="text-[#f4e4bc]">Dificuldade</TableHead>
                      <TableHead className="text-[#f4e4bc]">XP</TableHead>
                      <TableHead className="text-[#f4e4bc]">Status</TableHead>
                      <TableHead className="text-[#f4e4bc]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missoes.map((missao: any) => (
                      <TableRow key={missao.id} className="border-[#d4a054]/20">
                        <TableCell className="text-[#f4e4bc] font-medium">{missao.titulo}</TableCell>
                        <TableCell className="text-[#d4a054]">{missao.componente_nome}</TableCell>
                        <TableCell className="text-[#d4a054]">
                          <Badge variant="outline" className="border-[#d4a054] text-[#d4a054]">
                            Nível {missao.dificuldade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#f4e4bc]">{missao.xp_reward} XP</TableCell>
                        <TableCell>
                          <Badge 
                            variant={missao.ativa ? "default" : "secondary"}
                            className={missao.ativa ? "bg-green-600" : "bg-gray-600"}
                          >
                            {missao.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-[#4da3a9] hover:bg-[#4da3a9]/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#d4a054] hover:bg-[#d4a054]/10">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#8b4513] hover:bg-[#8b4513]/10">
                              <Brain className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Meus Alunos */}
          <TabsContent value="alunos" className="space-y-6">
            <Card className="bg-[#43341c] border-[#d4a054]">
              <CardHeader>
                <CardTitle className="text-[#f4e4bc] flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Acompanhamento de Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#d4a054]/20">
                      <TableHead className="text-[#f4e4bc]">Nome</TableHead>
                      <TableHead className="text-[#f4e4bc]">Turma</TableHead>
                      <TableHead className="text-[#f4e4bc]">Nível</TableHead>
                      <TableHead className="text-[#f4e4bc]">XP Total</TableHead>
                      <TableHead className="text-[#f4e4bc]">Progresso</TableHead>
                      <TableHead className="text-[#f4e4bc]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meusAlunos.map((aluno: any) => (
                      <TableRow key={aluno.id} className="border-[#d4a054]/20">
                        <TableCell className="text-[#f4e4bc] font-medium">{aluno.nome}</TableCell>
                        <TableCell className="text-[#d4a054]">{aluno.turma_nome}</TableCell>
                        <TableCell className="text-[#d4a054]">Nível {aluno.nivel || 1}</TableCell>
                        <TableCell className="text-[#f4e4bc]">{aluno.xp || 0} XP</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#2d1810] rounded-full h-2">
                              <div 
                                className="bg-[#4da3a9] h-2 rounded-full" 
                                style={{ width: `${Math.min((aluno.xp || 0) / 100 * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#d4a054]">
                              {Math.round((aluno.xp || 0) / 100 * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-[#4da3a9] hover:bg-[#4da3a9]/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[#d4a054] hover:bg-[#d4a054]/10">
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-[#43341c] border-[#d4a054]">
                <CardHeader>
                  <CardTitle className="text-[#f4e4bc] text-lg">Desempenho por Turma</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#4da3a9] hover:bg-[#3d8a8f] text-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#43341c] border-[#d4a054]">
                <CardHeader>
                  <CardTitle className="text-[#f4e4bc] text-lg">Progresso de Missões</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#8b4513] hover:bg-[#a0522d] text-white">
                    <Target className="w-4 h-4 mr-2" />
                    Ver Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#43341c] border-[#d4a054]">
                <CardHeader>
                  <CardTitle className="text-[#f4e4bc] text-lg">Diagnóstico Contínuo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#d4a054] hover:bg-[#b8904a] text-[#2d1810]">
                    <Clock className="w-4 h-4 mr-2" />
                    Ver Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Plano de Aula */}
        <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
          <DialogContent className="bg-[#43341c] border-[#d4a054] text-[#f4e4bc] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#f4e4bc]">Novo Plano de Aula</DialogTitle>
              <DialogDescription className="text-[#d4a054]">
                Crie um plano de aula trimestral para um dos seus componentes
              </DialogDescription>
            </DialogHeader>
            
            <Form {...planoForm}>
              <form onSubmit={planoForm.handleSubmit(onSubmitPlano)} className="space-y-4">
                <FormField
                  control={planoForm.control}
                  name="turma_componente_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#f4e4bc]">Componente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc]">
                            <SelectValue placeholder="Selecione um componente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#43341c] border-[#d4a054]">
                          {meusComponentes.map((componente: any) => (
                            <SelectItem 
                              key={componente.id} 
                              value={componente.id}
                              className="text-[#f4e4bc] focus:bg-[#d4a054] focus:text-[#2d1810]"
                            >
                              {componente.nome} - {componente.turma_nome}
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
                      <FormLabel className="text-[#f4e4bc]">Trimestre</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#43341c] border-[#d4a054]">
                          <SelectItem value="1º" className="text-[#f4e4bc] focus:bg-[#d4a054] focus:text-[#2d1810]">1º Trimestre</SelectItem>
                          <SelectItem value="2º" className="text-[#f4e4bc] focus:bg-[#d4a054] focus:text-[#2d1810]">2º Trimestre</SelectItem>
                          <SelectItem value="3º" className="text-[#f4e4bc] focus:bg-[#d4a054] focus:text-[#2d1810]">3º Trimestre</SelectItem>
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
                      <FormLabel className="text-[#f4e4bc]">Título</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Introdução à Álgebra"
                          className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc] placeholder:text-[#d4a054]/60"
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
                      <FormLabel className="text-[#f4e4bc]">Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva o conteúdo programático, objetivos e metodologia..."
                          className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc] placeholder:text-[#d4a054]/60 min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsPlanoModalOpen(false)}
                    className="border-[#d4a054] text-[#d4a054] hover:bg-[#d4a054] hover:text-[#2d1810]"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPlanoMutation.isPending}
                    className="bg-[#4da3a9] hover:bg-[#3d8a8f] text-white"
                  >
                    {createPlanoMutation.isPending ? "Salvando..." : "Salvar Plano"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal Missão IA */}
        <Dialog open={isMissaoModalOpen} onOpenChange={setIsMissaoModalOpen}>
          <DialogContent className="bg-[#43341c] border-[#d4a054] text-[#f4e4bc] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#f4e4bc] flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Gerar Missão com IA
              </DialogTitle>
              <DialogDescription className="text-[#d4a054]">
                Crie uma missão interativa gerada por IA para seus alunos
              </DialogDescription>
            </DialogHeader>
            
            <Form {...missaoForm}>
              <form onSubmit={missaoForm.handleSubmit(onSubmitMissao)} className="space-y-4">
                <FormField
                  control={missaoForm.control}
                  name="turma_componente_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#f4e4bc]">Componente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc]">
                            <SelectValue placeholder="Selecione um componente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#43341c] border-[#d4a054]">
                          {meusComponentes.map((componente: any) => (
                            <SelectItem 
                              key={componente.id} 
                              value={componente.id}
                              className="text-[#f4e4bc] focus:bg-[#d4a054] focus:text-[#2d1810]"
                            >
                              {componente.nome} - {componente.turma_nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={missaoForm.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#f4e4bc]">Título</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Desafio Matemático"
                            className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc] placeholder:text-[#d4a054]/60"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={missaoForm.control}
                    name="dificuldade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#f4e4bc]">Dificuldade (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="1"
                            max="5"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={missaoForm.control}
                    name="xp_reward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#f4e4bc]">Recompensa XP</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="1"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc]"
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
                        <FormLabel className="text-[#f4e4bc]">Tempo (minutos)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="5"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={missaoForm.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#f4e4bc]">Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva o que a IA deve gerar para esta missão..."
                          className="bg-[#2d1810] border-[#d4a054] text-[#f4e4bc] placeholder:text-[#d4a054]/60 min-h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsMissaoModalOpen(false)}
                    className="border-[#d4a054] text-[#d4a054] hover:bg-[#d4a054] hover:text-[#2d1810]"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMissaoMutation.isPending}
                    className="bg-[#8b4513] hover:bg-[#a0522d] text-white"
                  >
                    {createMissaoMutation.isPending ? "Gerando..." : "Gerar com IA"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}