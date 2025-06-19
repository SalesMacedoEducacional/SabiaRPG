import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSchool } from "@/context/SchoolContext";
import { apiRequest } from "@/lib/queryClient";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";
import { useGlobalDataSync, triggerDataMutation } from "@/hooks/useGlobalDataSync";
import { CardLoadingOverlay } from "@/components/ui/loading-spinner";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search,
  Building,
  Filter,
  Settings
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EscolasDetailModal,
  ProfessoresDetailModal,
  AlunosDetailModal,
  TurmasDetailModal
} from "./DetailModals";
import ComponentManagementModal from "./ComponentManagementModal";

// Interfaces para os dados
interface Escola {
  id: string;
  nome: string;
  cidade: string;
  ativo?: boolean;
  estado?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  diretor?: string;
  cidades?: { nome: string };
  estados?: { nome: string; sigla: string };
}

interface Professor {
  id: string;
  usuarios: {
    nome: string;
    cpf: string;
    telefone: string;
    email?: string;
  };
  escola_id?: string;
  escola_nome?: string;
  disciplinas?: string[];
  ativo?: boolean;
}

interface Aluno {
  id: string;
  usuarios: {
    nome: string;
  };
  turmas: {
    nome: string;
  };
  matriculas: {
    numero_matricula: string;
  };
  escola_id?: string;
  escola_nome?: string;
}

interface Turma {
  id: string;
  nome: string;
  serie: string;
  ano_letivo: number;
  turno: string;
  total_alunos: number;
  escola_id?: string;
  escola_nome?: string;
}

// Componente para o card de total de escolas
export function TotalEscolasCard() {
  const { toast } = useToast();
  const { refreshAll } = useAutoRefresh();
  const { escolasVinculadas, dashboardStats, isLoading, refreshStats } = useSchool();
  const { forceRefreshAfterMutation } = useRealtimeSubscriptions();
  const { isRefreshing: globalRefreshing } = useGlobalDataSync();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statsForced, setStatsForced] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Forçar busca direta do endpoint se os dados não carregarem
  useEffect(() => {
    const forceLoadStats = async () => {
      try {
        const response = await apiRequest("GET", "/api/manager/dashboard-stats");
        if (response.ok) {
          const data = await response.json();
          console.log('TotalEscolasCard: Dados forçados carregados:', data);
          setStatsForced(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados forçados:', error);
      }
    };

    // Se não há dados no contexto após 2 segundos, forçar carregamento
    const timer = setTimeout(() => {
      if (dashboardStats?.totalEscolas === 0) {
        console.log('TotalEscolasCard: Forçando carregamento direto');
        forceLoadStats();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [dashboardStats]);

  // Usar dados forçados se disponíveis, senão dados do contexto
  const totalEscolas = statsForced?.totalEscolas || dashboardStats?.totalEscolas || 0;
  const escolas = escolasVinculadas || [];

  useEffect(() => {
    // Listeners para refresh automático
    const handleRefresh = () => {
      refreshStats();
    };

    window.addEventListener('refreshAllData', handleRefresh);
    window.addEventListener('refreshSchoolData', handleRefresh);

    return () => {
      window.removeEventListener('refreshAllData', handleRefresh);
      window.removeEventListener('refreshSchoolData', handleRefresh);
    };
  }, [refreshStats]);

  return (
    <>
      <CardLoadingOverlay isLoading={isLoading || isRefreshing || globalRefreshing}>
        <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
          <div className="flex items-center mb-2">
            <div className="rounded-full bg-[#4a4639] p-2 mr-3">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium text-white">Total de Escolas Vinculadas</div>
          </div>
        
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-white mt-2">{totalEscolas}</div>
              <div className="text-xs text-accent mt-1">{totalEscolas} ativas</div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
                onClick={() => setIsModalOpen(true)}
                disabled={totalEscolas === 0}
              >
                <Search className="h-3 w-3 mr-1" /> Ver Detalhes
              </Button>
            </>
          )}
        </div>
      </CardLoadingOverlay>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex items-center">
              <School className="h-5 w-5 mr-2" /> Escolas Vinculadas
            </DialogTitle>
            <DialogDescription className="text-accent">
              Lista de escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome da Escola</TableHead>
                  <TableHead className="text-white">Cidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolas.length > 0 ? (
                  escolas.map((escola) => (
                    <TableRow key={escola.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{escola.nome}</TableCell>
                      <TableCell className="text-white">{escola.cidade}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                      Nenhuma escola encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente para o card de total de professores
export function TotalProfessoresCard() {
  const { toast } = useToast();
  const { refreshAll } = useAutoRefresh();
  const { escolasVinculadas, dashboardStats, isLoading, refreshStats } = useSchool();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");
  const [statsForced, setStatsForced] = useState<any>(null);

  // Forçar busca direta do endpoint se os dados não carregarem
  useEffect(() => {
    const forceLoadStats = async () => {
      try {
        const response = await apiRequest("GET", "/api/manager/dashboard-stats");
        if (response.ok) {
          const data = await response.json();
          console.log('TotalProfessoresCard: Dados forçados carregados:', data);
          setStatsForced(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados forçados:', error);
      }
    };

    const timer = setTimeout(() => {
      if (dashboardStats?.totalProfessores === 0) {
        console.log('TotalProfessoresCard: Forçando carregamento direto');
        forceLoadStats();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [dashboardStats]);

  // Usar dados forçados se disponíveis, senão dados do contexto
  const totalProfessores = statsForced?.totalProfessores || dashboardStats?.totalProfessores || 0;
  const escolas = escolasVinculadas || [];

  const fetchProfessoresDetalhes = async () => {
    try {
      const response = await apiRequest("GET", "/api/professores");
      const data = await response.json();
      setProfessores(data.professores || []);
    } catch (error) {
      console.error("Erro ao buscar detalhes dos professores:", error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes dos professores",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Listeners para refresh automático
    const handleRefresh = () => {
      refreshStats();
    };

    window.addEventListener('refreshAllData', handleRefresh);
    window.addEventListener('refreshSchoolData', handleRefresh);

    return () => {
      window.removeEventListener('refreshAllData', handleRefresh);
      window.removeEventListener('refreshSchoolData', handleRefresh);
    };
  }, [refreshStats]);

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Total de Professores</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">{totalProfessores}</div>
            <div className="text-xs text-accent mt-1">Em todas as escolas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => {
                setIsModalOpen(true);
                fetchProfessoresDetalhes();
              }}
              disabled={totalProfessores === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex items-center">
              <Users className="h-5 w-5 mr-2" /> Professores Cadastrados
            </DialogTitle>
            <DialogDescription className="text-accent">
              Lista de professores nas escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          {/* Filtro por Escola */}
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-4 w-4 text-primary" />
            <Select value={filtroEscola} onValueChange={setFiltroEscola}>
              <SelectTrigger className="w-[280px] bg-[#4a4639] border-[#D47C06] text-white">
                <SelectValue placeholder="Filtrar por escola" />
              </SelectTrigger>
              <SelectContent className="bg-[#4a4639] border-[#D47C06] text-white">
                <SelectItem value="todas">Todas as escolas</SelectItem>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome do Professor</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Disciplinas</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const professoresFiltrados = filtroEscola === "todas" 
                    ? professores 
                    : professores.filter(prof => prof.escola_id === filtroEscola);
                  
                  return professoresFiltrados.length > 0 ? (
                    professoresFiltrados.map((professor) => (
                      <TableRow key={professor.id} className="hover:bg-[#43341c]">
                        <TableCell className="text-white font-medium">{professor.usuarios.nome}</TableCell>
                        <TableCell className="text-white">{professor.usuarios.email || "Não informado"}</TableCell>
                        <TableCell className="text-white">{professor.usuarios.telefone || "Não informado"}</TableCell>
                        <TableCell className="text-white">
                          {professor.disciplinas && professor.disciplinas.length > 0 
                            ? professor.disciplinas.join(", ") 
                            : "Não informado"}
                        </TableCell>
                        <TableCell className="text-white">{professor.escola_nome || "Não informado"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {filtroEscola === "todas" ? "Nenhum professor encontrado" : "Nenhum professor encontrado para esta escola"}
                      </TableCell>
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Interface para dados de engajamento
interface EngagementData {
  totalAlunos: number;
  alunosAtivos7Dias: number;
  alunosAtivos30Dias: number;
  taxaEngajamento7Dias: number;
  taxaEngajamento30Dias: number;
  escolas: Escola[];
}

interface AlunoAtivo {
  id: string;
  nome: string;
  email: string;
  ultimaSessao: string;
  totalSessoes: number;
  diasEngajamento: number;
  escola: string;
}

// Componente para o card de total de alunos (sem engajamento)
export function TotalAlunosCard() {
  const { toast } = useToast();
  const { escolasVinculadas, dashboardStats, isLoading, refreshStats } = useSchool();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");
  const [statsForced, setStatsForced] = useState<any>(null);

  // Forçar busca direta do endpoint se os dados não carregarem
  useEffect(() => {
    const forceLoadStats = async () => {
      try {
        const response = await apiRequest("GET", "/api/manager/dashboard-stats");
        if (response.ok) {
          const data = await response.json();
          console.log('TotalAlunosCard: Dados forçados carregados:', data);
          setStatsForced(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados forçados:', error);
      }
    };

    const timer = setTimeout(() => {
      if (dashboardStats?.totalAlunos === 0) {
        console.log('TotalAlunosCard: Forçando carregamento direto');
        forceLoadStats();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [dashboardStats]);

  // Usar dados forçados se disponíveis, senão dados do contexto
  const totalAlunos = statsForced?.totalAlunos || dashboardStats?.totalAlunos || 0;
  const escolas = escolasVinculadas || [];

  const fetchAlunosDetalhes = async () => {
    try {
      const response = await apiRequest("GET", "/api/alunos");
      const data = await response.json();
      setAlunos(data.alunos || []);
    } catch (error) {
      console.error("Erro ao buscar detalhes dos alunos:", error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes dos alunos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Listeners para refresh automático
    const handleRefresh = () => {
      refreshStats();
    };

    window.addEventListener('refreshAllData', handleRefresh);
    window.addEventListener('refreshSchoolData', handleRefresh);

    return () => {
      window.removeEventListener('refreshAllData', handleRefresh);
      window.removeEventListener('refreshSchoolData', handleRefresh);
    };
  }, [refreshStats]);

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Total de Alunos</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">
              {totalAlunos}
            </div>
            <div className="text-xs text-accent mt-1">
              Alunos cadastrados no sistema
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => {
                setIsModalOpen(true);
                fetchAlunosDetalhes();
              }}
              disabled={totalAlunos === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" /> Lista de Alunos Cadastrados
            </DialogTitle>
            <DialogDescription className="text-accent">
              Todos os alunos cadastrados no sistema
            </DialogDescription>
          </DialogHeader>
          
          {/* Filtros */}
          <div className="flex gap-4 mb-4">
            <Select value={filtroEscola} onValueChange={setFiltroEscola}>
              <SelectTrigger className="w-64 bg-[#4a4639] border-[#D47C06] text-white">
                <SelectValue placeholder="Escola" />
              </SelectTrigger>
              <SelectContent className="bg-[#4a4639] border-[#D47C06]">
                <SelectItem value="todas">Todas as escolas</SelectItem>
                {escolas?.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome do Aluno</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.length > 0 ? (
                  alunos
                    .filter(aluno => filtroEscola === "todas" || aluno.escola_id === filtroEscola)
                    .map((aluno) => (
                      <TableRow key={aluno.id} className="hover:bg-[#43341c]">
                        <TableCell className="text-white font-medium">{aluno.nome}</TableCell>
                        <TableCell className="text-white">{aluno.email}</TableCell>
                        <TableCell className="text-white">{aluno.cpf || "Não informado"}</TableCell>
                        <TableCell className="text-white">{aluno.telefone || "Não informado"}</TableCell>
                        <TableCell className="text-white">
                          <Badge variant={aluno.ativo ? "default" : "secondary"} className={aluno.ativo ? "bg-green-600" : "bg-gray-600"}>
                            {aluno.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente para o card de total de turmas
export function TotalTurmasCard() {
  const { toast } = useToast();
  const { escolasVinculadas, dashboardStats, isLoading, refreshStats } = useSchool();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");
  const [statsForced, setStatsForced] = useState<any>(null);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState<boolean>(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  // Forçar busca direta do endpoint se os dados não carregarem
  useEffect(() => {
    const forceLoadStats = async () => {
      try {
        const response = await apiRequest("GET", "/api/manager/dashboard-stats");
        if (response.ok) {
          const data = await response.json();
          console.log('TotalTurmasCard: Dados forçados carregados:', data);
          setStatsForced(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados forçados:', error);
      }
    };

    const timer = setTimeout(() => {
      if (dashboardStats?.turmasAtivas === 0) {
        console.log('TotalTurmasCard: Forçando carregamento direto');
        forceLoadStats();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [dashboardStats]);

  // Usar dados forçados se disponíveis, senão dados do contexto
  const totalTurmas = statsForced?.turmasAtivas || dashboardStats?.turmasAtivas || 0;
  const escolas = escolasVinculadas || [];

  const fetchTurmasDetalhes = async () => {
    try {
      const response = await apiRequest("GET", "/api/turmas");
      const data = await response.json();
      setTurmas(Array.isArray(data) ? data : data.turmas || []);
    } catch (error) {
      console.error("Erro ao buscar detalhes das turmas:", error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes das turmas",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Listeners para refresh automático
    const handleRefresh = () => {
      refreshStats();
    };

    window.addEventListener('refreshAllData', handleRefresh);
    window.addEventListener('refreshSchoolData', handleRefresh);

    return () => {
      window.removeEventListener('refreshAllData', handleRefresh);
      window.removeEventListener('refreshSchoolData', handleRefresh);
    };
  }, [refreshStats]);

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Turmas Ativas</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">{totalTurmas}</div>
            <div className="text-xs text-accent mt-1">Distribuídas em todas as escolas</div>
            
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#57533f] transition-colors"
                onClick={() => {
                  setIsModalOpen(true);
                  fetchTurmasDetalhes();
                }}
                disabled={totalTurmas === 0}
              >
                <Search className="h-3 w-3 mr-1" /> Ver Detalhes
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#8c7851] border border-[#D47C06] text-white px-3 py-1.5 rounded hover:bg-[#a08962] transition-colors"
                onClick={() => {
                  window.location.href = '/class-management';
                }}
              >
                <Settings className="h-3 w-3 mr-1" /> Gerenciar Turmas
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex items-center">
              <BookOpen className="h-5 w-5 mr-2" /> Turmas Ativas
            </DialogTitle>
            <DialogDescription className="text-accent">
              Lista de turmas nas escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <Select value={filtroEscola} onValueChange={setFiltroEscola}>
              <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                <SelectValue placeholder="Filtrar por escola" />
              </SelectTrigger>
              <SelectContent className="bg-[#312e26] border-[#D47C06]">
                <SelectItem value="todas" className="text-white">Todas as escolas</SelectItem>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id} className="text-white">
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Série</TableHead>
                  <TableHead className="text-white">Turno</TableHead>
                  <TableHead className="text-white">Ano Letivo</TableHead>
                  <TableHead className="text-white">Total de Alunos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const turmasFiltradas = filtroEscola === "todas" 
                    ? turmas 
                    : turmas.filter(turma => turma.escola_id === filtroEscola);
                  
                  return turmasFiltradas.length > 0 ? (
                    turmasFiltradas.map((turma) => (
                      <TableRow key={turma.id} className="hover:bg-[#43341c]">
                        <TableCell className="text-white font-medium">{turma.nome}</TableCell>
                        <TableCell className="text-white">{turma.serie}</TableCell>
                        <TableCell className="text-white">{turma.turno}</TableCell>
                        <TableCell className="text-white">{turma.ano_letivo}</TableCell>
                        <TableCell className="text-white">{turma.total_alunos || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {filtroEscola === "todas" ? "Nenhuma turma encontrada" : "Nenhuma turma encontrada para esta escola"}
                      </TableCell>
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}