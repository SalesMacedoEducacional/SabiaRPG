import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Componentes do shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Plus, 
  MoreHorizontal, 
  Search, 
  Pencil, 
  Trash2, 
  Users, 
  Info, 
  CalendarClock,
  School,
  Filter,
  FileDown,
  Loader2
} from "lucide-react";

// Interface para representar uma Turma
interface Turma {
  id: string;
  nome: string; // Nome da turma no banco está como "nome", não "nome_turma"
  nome_turma?: string; // Manter para compatibilidade com código existente
  turno: string;
  serie: string;
  modalidade: string;
  ano_letivo: number;
  descricao?: string; // Campo de descrição no banco
  observacoes?: string; // Compatibilidade com código existente
  escola_id: string;
  escola_nome?: string;
  criado_em: string;
}

// Interface para representar uma Escola
interface Escola {
  id: string;
  nome: string;
  codigo: string;
}

export default function ClassListPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [anoLetivoFilter, setAnoLetivoFilter] = useState<string>("todos");
  const [escolaFilter, setEscolaFilter] = useState<string>("todas");
  const [turnoFilter, setTurnoFilter] = useState<string>("todos");
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Buscar turmas
  const { data: turmas, isLoading: isLoadingTurmas, refetch: refetchTurmas } = useQuery({
    queryKey: ['/api/turmas'],
    enabled: !!user && (user.role === 'manager' || user.role === 'admin'),
  });

  // Buscar escolas do gestor
  const { data: escolas, isLoading: isLoadingEscolas } = useQuery({
    queryKey: ['/api/escolas/gestor'],
    enabled: !!user && user.role === 'manager',
  });

  // Função para excluir uma turma
  const handleDeleteTurma = async (turmaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(turmaId);
    
    try {
      const response = await apiRequest("DELETE", `/api/turmas/${turmaId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir turma");
      }
      
      // Atualizar a lista de turmas
      refetchTurmas();
      
      toast({
        title: "Turma excluída",
        description: "A turma foi excluída com sucesso",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao excluir turma:", error);
      toast({
        title: "Erro ao excluir turma",
        description: error instanceof Error ? error.message : "Erro desconhecido ao excluir turma",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Filtrar e ordenar turmas
  const turmasFiltradas = turmas
    ? turmas
        .filter((turma: Turma) => {
          // Filtrar por termo de busca
          const matchesSearch = 
            searchTerm === "" || 
            (turma.nome && turma.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (turma.nome_turma && turma.nome_turma.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (turma.serie && turma.serie.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (turma.modalidade && turma.modalidade.toLowerCase().includes(searchTerm.toLowerCase()));
          
          // Filtrar por ano letivo
          const matchesAnoLetivo = 
            anoLetivoFilter === "todos" || 
            turma.ano_letivo.toString() === anoLetivoFilter;
          
          // Filtrar por escola
          const matchesEscola = 
            escolaFilter === "todas" || 
            turma.escola_id === escolaFilter;
          
          // Filtrar por turno
          const matchesTurno = 
            turnoFilter === "todos" || 
            turma.turno === turnoFilter;
          
          return matchesSearch && matchesAnoLetivo && matchesEscola && matchesTurno;
        })
        // Ordenar por nome da turma (usando nome ou nome_turma, dependendo do que estiver disponível)
        .sort((a: Turma, b: Turma) => {
          const nomeA = a.nome || a.nome_turma || '';
          const nomeB = b.nome || b.nome_turma || '';
          return nomeA.localeCompare(nomeB);
        })
    : [];

  // Encontrar o nome da escola para cada turma
  const getTurmaComEscolaNome = (turma: Turma): Turma => {
    if (!escolas) return turma;
    
    const escola = escolas.find((e: Escola) => e.id === turma.escola_id);
    return {
      ...turma,
      escola_nome: escola ? escola.nome : "Escola não encontrada",
    };
  };

  // Navegar para a tela de edição
  const handleEdit = (turmaId: string) => {
    setLocation(`/turmas/${turmaId}/editar`);
  };

  // Navegar para a tela de detalhes
  const handleViewDetails = (turmaId: string) => {
    setLocation(`/turmas/${turmaId}`);
  };

  // Se não for gestor ou admin, redirecionar para o dashboard
  if (user && user.role !== 'manager' && user.role !== 'admin') {
    setLocation("/manager-dashboard");
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/manager-dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Painel</span>
          </Button>
          <h1 className="text-2xl font-bold">Gerenciamento de Turmas</h1>
        </div>
        <Button onClick={() => setLocation("/class-registration")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Pesquisa</CardTitle>
          <CardDescription>Utilize os filtros para encontrar turmas específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar turma..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Select
                onValueChange={(value) => setAnoLetivoFilter(value)}
                defaultValue="todos"
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Ano Letivo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os anos</SelectItem>
                  <SelectItem value={currentYear.toString()}>
                    {currentYear}
                  </SelectItem>
                  <SelectItem value={nextYear.toString()}>
                    {nextYear}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                onValueChange={(value) => setEscolaFilter(value)}
                defaultValue="todas"
                disabled={isLoadingEscolas || !escolas || escolas.length <= 1}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <School className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Escola" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as escolas</SelectItem>
                  {escolas?.map((escola: Escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                onValueChange={(value) => setTurnoFilter(value)}
                defaultValue="todos"
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Turno" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os turnos</SelectItem>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                  <SelectItem value="Integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" className="w-full">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Turmas</CardTitle>
          <CardDescription>
            {isLoadingTurmas
              ? "Carregando turmas..."
              : `${turmasFiltradas.length} turmas encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTurmas ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : turmasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma turma encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {searchTerm || anoLetivoFilter !== "todos" || escolaFilter !== "todas" || turnoFilter !== "todos"
                  ? "Tente ajustar os filtros ou os termos de busca."
                  : "Cadastre uma nova turma para começar."}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation("/class-registration")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Nova Turma
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Turma</TableHead>
                    <TableHead>Série</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Ano Letivo</TableHead>
                    {escolas && escolas.length > 1 && (
                      <TableHead>Escola</TableHead>
                    )}
                    <TableHead>Alunos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turmasFiltradas.map((turma: Turma) => {
                    const turmaComEscola = getTurmaComEscolaNome(turma);
                    return (
                      <TableRow key={turma.id}>
                        <TableCell className="font-medium">
                          {turma.nome || turma.nome_turma || "Nome indisponível"}
                        </TableCell>
                        <TableCell>{turma.serie || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{turma.turno || "-"}</Badge>
                        </TableCell>
                        <TableCell>{turma.ano_letivo || "-"}</TableCell>
                        {escolas && escolas.length > 1 && (
                          <TableCell>{turmaComEscola.escola_nome || "-"}</TableCell>
                        )}
                        <TableCell>
                          {/* Informação de alunos não disponível no momento */}
                          <span>-</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(turma.id)}
                              >
                                <Info className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(turma.id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTurma(turma.id)}
                                disabled={isDeleting === turma.id}
                                className="text-destructive focus:text-destructive"
                              >
                                {isDeleting === turma.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}