import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Users, 
  Eye,
  Loader2,
  BookOpen,
  School,
  Clock,
  GraduationCap,
  MoreHorizontal
} from "lucide-react";

// Interface para representar uma Turma
interface Turma {
  id: string;
  nome: string;
  nome_turma?: string;
  turno: string;
  serie: string;
  modalidade: string;
  ano_letivo: number;
  descricao?: string;
  observacoes?: string;
  escola_id: string;
  escola_nome?: string;
  criado_em: string;
  professor_responsavel?: {
    id: string;
    nome: string;
    email: string;
  };
}

// Interface para representar uma Escola
interface Escola {
  id: string;
  nome: string;
  codigo: string;
}

export default function ClassListPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState("");
  const [escolaFilter, setEscolaFilter] = useState<string>("todas");
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Buscar turmas (incluir filtro de escola na query)
  const { data: turmas = [], isLoading: isLoadingTurmas } = useQuery({
    queryKey: ['/api/turmas', escolaFilter],
    queryFn: async () => {
      let url = '/api/turmas';
      if (escolaFilter && escolaFilter !== 'todas') {
        url += `?escola_id=${escolaFilter}`;
      }
      return apiRequest('GET', url);
    },
    enabled: !!user && (user.role === 'manager' || user.role === 'admin'),
  });

  // Buscar escolas do gestor
  const { data: escolas = [], isLoading: isLoadingEscolas } = useQuery({
    queryKey: ['/api/escolas/gestor'],
    enabled: !!user && (user.role === 'manager' || user.role === 'admin'),
  });

  // Mutation para deletar turma
  const deleteMutation = useMutation({
    mutationFn: async (turmaId: string) => {
      const response = await fetch(`/api/turmas/${turmaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir turma');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/turmas'] });
      toast({
        title: "Sucesso",
        description: "Turma excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir turma:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir turma. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Filtrar turmas
  const turmasFiltradas = Array.isArray(turmas) ? turmas.filter((turma: Turma) => {
    const matchesSearch = turma.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turma.nome_turma?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEscola = escolaFilter === "todas" || turma.escola_id === escolaFilter;
    
    return matchesSearch && matchesEscola;
  }) : [];

  // Função para obter turma com nome da escola
  const getTurmaComEscolaNome = (turma: Turma): Turma => {
    const escola = Array.isArray(escolas) ? escolas.find((e: Escola) => e.id === turma.escola_id) : null;
    return {
      ...turma,
      escola_nome: escola?.nome || 'Escola não identificada'
    };
  };

  // Handlers
  const handleViewDetails = (turma: Turma) => {
    setSelectedTurma(getTurmaComEscolaNome(turma));
    setShowDetailsModal(true);
  };

  const handleEdit = (turmaId: string) => {
    setLocation(`/class-edit/${turmaId}`);
  };

  const handleDelete = (turmaId: string) => {
    setIsDeleting(turmaId);
    deleteMutation.mutate(turmaId, {
      onSettled: () => setIsDeleting(null)
    });
  };

  // Verificar permissões
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#312e2a] flex items-center justify-center">
        <Card className="bg-[#2a2621] border-accent">
          <CardContent className="p-6">
            <p className="text-accent">Acesso negado. Apenas gestores podem visualizar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingTurmas || isLoadingEscolas) {
    return (
      <div className="min-h-screen bg-[#312e2a] flex items-center justify-center">
        <div className="flex items-center gap-2 text-accent">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando turmas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-accent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/manager")}
              className="flex items-center gap-2 bg-[#2a2621] border-accent text-accent hover:bg-accent hover:text-[#2a2621]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-white">GERENCIAMENTO DE TURMAS</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filtros */}
        <Card className="mb-6 bg-[#2a2621] border-accent">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <School className="h-5 w-5" />
              Escola Selecionada
            </CardTitle>
            <CardDescription className="text-gray-400">
              Selecione uma escola para gerenciar suas turmas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={escolaFilter} onValueChange={setEscolaFilter}>
                <SelectTrigger className="bg-[#312e2a] border-accent text-white">
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent className="bg-[#312e2a] border-accent">
                  <SelectItem value="todas" className="text-white hover:bg-accent hover:text-[#312e2a]">
                    Todas as Escolas
                  </SelectItem>
                  {Array.isArray(escolas) && escolas.map((escola: Escola) => (
                    <SelectItem 
                      key={escola.id} 
                      value={escola.id}
                      className="text-white hover:bg-accent hover:text-[#312e2a]"
                    >
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue="todas">
                <SelectTrigger className="bg-[#312e2a] border-accent text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#312e2a] border-accent">
                  <SelectItem value="todas" className="text-white hover:bg-accent hover:text-[#312e2a]">
                    Todas as séries
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar turma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#312e2a] border-accent text-white placeholder-gray-400"
                />
              </div>

              <Button 
                onClick={() => setLocation("/class-registration")}
                className="bg-accent text-[#312e2a] hover:bg-accent/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Header da Seção de Turmas */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">TURMAS</h2>
          <p className="text-gray-400">Gerencie as turmas cadastradas</p>
        </div>

        {/* Tabela de Turmas */}
        <Card className="bg-[#2a2621] border-accent">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-accent">
                  <TableHead className="text-accent font-semibold">Nome da Turma</TableHead>
                  <TableHead className="text-accent font-semibold">Série</TableHead>
                  <TableHead className="text-accent font-semibold">Escola</TableHead>
                  <TableHead className="text-accent font-semibold">Ano Letivo</TableHead>
                  <TableHead className="text-accent font-semibold">Alunos</TableHead>
                  <TableHead className="text-accent font-semibold">Status</TableHead>
                  <TableHead className="text-accent font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-accent" />
                        <p className="text-gray-400">
                          {searchTerm || escolaFilter !== "todas" 
                            ? "Nenhuma turma encontrada com os filtros aplicados." 
                            : "Nenhuma turma cadastrada."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  turmasFiltradas.map((turma: Turma) => {
                    const turmaComEscola = getTurmaComEscolaNome(turma);
                    return (
                      <TableRow key={turma.id} className="border-accent hover:bg-[#312e2a]/50">
                        <TableCell className="text-white font-medium">
                          {turma.nome || turma.nome_turma}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {turma.serie}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {turmaComEscola.escola_nome}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {turma.ano_letivo}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            0
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Ativa
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(turma)}
                              className="bg-transparent border-accent text-accent hover:bg-accent hover:text-[#2a2621]"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Detalhes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(turma.id)}
                              className="bg-transparent border-accent text-accent hover:bg-accent hover:text-[#2a2621]"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  disabled={isDeleting === turma.id}
                                >
                                  {isDeleting === turma.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#2a2621] border-accent">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-accent">Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    Tem certeza que deseja excluir a turma "{turma.nome || turma.nome_turma}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-transparent border-accent text-accent hover:bg-accent hover:text-[#312e2a]">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(turma.id)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Total */}
        <div className="mt-4 text-sm text-gray-400">
          Total: {turmasFiltradas.length} turma{turmasFiltradas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="bg-[#2a2621] border-accent text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-accent">Detalhes da Turma</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informações completas sobre a turma selecionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedTurma && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-accent">Nome da Turma</label>
                  <p className="text-white">{selectedTurma.nome || selectedTurma.nome_turma}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-accent">Série</label>
                  <p className="text-white">{selectedTurma.serie}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-accent">Turno</label>
                  <p className="text-white">{selectedTurma.turno}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-accent">Modalidade</label>
                  <p className="text-white">{selectedTurma.modalidade}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-accent">Ano Letivo</label>
                  <p className="text-white">{selectedTurma.ano_letivo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-accent">Escola</label>
                  <p className="text-white">{selectedTurma.escola_nome}</p>
                </div>
              </div>

              {selectedTurma.professor_responsavel && (
                <div>
                  <label className="text-sm font-medium text-accent">Professor Responsável</label>
                  <div className="bg-[#312e2a] p-3 rounded-md">
                    <p className="text-white font-medium">{selectedTurma.professor_responsavel.nome}</p>
                    <p className="text-gray-400 text-sm">{selectedTurma.professor_responsavel.email}</p>
                  </div>
                </div>
              )}

              {selectedTurma.descricao && (
                <div>
                  <label className="text-sm font-medium text-accent">Descrição</label>
                  <p className="text-white">{selectedTurma.descricao}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-transparent border-accent text-accent hover:bg-accent hover:text-[#2a2621]"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedTurma.id);
                  }}
                  className="bg-accent text-[#2a2621] hover:bg-accent/90"
                >
                  Editar Turma
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}