import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search,
  Building,
  Filter
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
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  };
  escola_id?: string;
  escola_nome?: string;
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
}

// Componente para o card de total de escolas
export function TotalEscolasCard() {
  const { toast } = useToast();
  const [totalEscolas, setTotalEscolas] = useState<number>(0);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [escolaToDelete, setEscolaToDelete] = useState<Escola | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/gestor/escolas");
        setTotalEscolas(Array.isArray(response) ? response.length : 0);
        setEscolas(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao buscar escolas:", error);
        toast({
          title: "Erro ao carregar escolas",
          description: "Não foi possível carregar as informações de escolas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleEditEscola = (escola: Escola) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A edição de escola será implementada em breve.",
    });
  };

  const handleDeleteEscola = (escola: Escola) => {
    setEscolaToDelete(escola);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!escolaToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/escolas/${escolaToDelete.id}`);
      const response = await apiRequest("GET", "/api/gestor/escolas");
      setTotalEscolas(Array.isArray(response) ? response.length : 0);
      setEscolas(Array.isArray(response) ? response : []);
      
      toast({
        title: "Escola excluída",
        description: "A escola foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a escola.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEscolaToDelete(null);
    }
  };

  return (
    <>
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
                  <TableHead className="text-white">Estado</TableHead>
                  <TableHead className="text-white">Ações Administrativas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolas.length > 0 ? (
                  escolas.map((escola) => (
                    <TableRow key={escola.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{escola.nome}</TableCell>
                      <TableCell className="text-white">{escola.cidades?.nome || escola.cidade}</TableCell>
                      <TableCell className="text-white">{escola.estados?.sigla || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-900/30 border-blue-600 text-blue-400 hover:bg-blue-900/50 text-xs px-2 py-1"
                            onClick={() => handleEditEscola(escola)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-900/30 border-red-600 text-red-400 hover:bg-red-900/50 text-xs px-2 py-1"
                            onClick={() => handleDeleteEscola(escola)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Nenhuma escola encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-[#2d2a21] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-white/70">
              Tem certeza que deseja excluir a escola "{escolaToDelete?.nome}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-gray-900/30 border-gray-600 text-gray-400 hover:bg-gray-900/50"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={confirmDelete}
              className="bg-red-900/30 border-red-600 text-red-400 hover:bg-red-900/50"
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente para o card de total de professores
export function TotalProfessoresCard() {
  const { toast } = useToast();
  const [totalProfessores, setTotalProfessores] = useState<number>(0);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Requisição API: GET /api/professores', '');
        console.log('Requisição API: GET /api/escolas/gestor', '');
        
        // Buscar professores e escolas em paralelo
        const [professoresResponse, escolasResponse] = await Promise.all([
          apiRequest("GET", "/api/gestor/professores"),
          apiRequest("GET", "/api/gestor/escolas")
        ]);
        
        console.log('Resposta GET /api/professores: status', professoresResponse.status);
        console.log('Resposta GET /api/escolas/gestor: status', escolasResponse.status);
        
        const professoresData = await professoresResponse.json();
        const escolasData = await escolasResponse.json();
        
        console.log('Professores recebidos:', professoresData);
        console.log('Escolas vinculadas recebidas para professores:', escolasData);
        
        // Ajustar formato de resposta conforme as APIs do dashboard
        setTotalProfessores(professoresData.total || 0);
        setProfessores(professoresData.professores || []);
        setEscolas(Array.isArray(escolasData) ? escolasData : (escolasData.escolas || []));
      } catch (error) {
        console.error("Erro ao buscar professores:", error);
        toast({
          title: "Erro ao carregar professores",
          description: "Não foi possível carregar as informações de professores",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
            <div className="text-xs text-accent mt-1">Nas escolas vinculadas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
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
                {(escolas || []).map((escola) => (
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
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
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
                        <TableCell className="text-white">{professor.usuarios.cpf}</TableCell>
                        <TableCell className="text-white">{professor.usuarios.telefone || "Não informado"}</TableCell>
                        <TableCell className="text-white">{professor.escola_nome || "Não informado"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
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

// Componente para o card de total de alunos
export function TotalAlunosCard() {
  const { toast } = useToast();
  const [totalAlunos, setTotalAlunos] = useState<number>(0);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Buscar alunos e escolas em paralelo
        const [alunosResponse, escolasResponse] = await Promise.all([
          apiRequest("GET", "/api/alunos"),
          apiRequest("GET", "/api/escolas/gestor")
        ]);
        
        const alunosData = await alunosResponse.json();
        const escolasData = await escolasResponse.json();
        
        setTotalAlunos(alunosData.total || 0);
        setAlunos(alunosData.alunos || []);
        setEscolas(Array.isArray(escolasData) ? escolasData : []);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        toast({
          title: "Erro ao carregar alunos",
          description: "Não foi possível carregar as informações de alunos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
            <div className="text-3xl font-bold text-white mt-2">{totalAlunos}</div>
            <div className="text-xs text-accent mt-1">Nas escolas vinculadas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalAlunos === 0}
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
              <GraduationCap className="h-5 w-5 mr-2" /> Alunos Matriculados
            </DialogTitle>
            <DialogDescription className="text-accent">
              Lista de alunos nas escolas sob sua gestão
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
                {(escolas || []).map((escola) => (
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
                  <TableHead className="text-white">Nº Matrícula</TableHead>
                  <TableHead className="text-white">Turma</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const alunosFiltrados = filtroEscola === "todas" 
                    ? alunos 
                    : alunos.filter(aluno => aluno.escola_id === filtroEscola);
                  
                  return alunosFiltrados.length > 0 ? (
                    alunosFiltrados.map((aluno) => (
                      <TableRow key={aluno.id} className="hover:bg-[#43341c]">
                        <TableCell className="text-white font-medium">{aluno.usuarios.nome}</TableCell>
                        <TableCell className="text-white">{aluno.matriculas?.numero_matricula || "N/A"}</TableCell>
                        <TableCell className="text-white">{aluno.turmas?.nome || "N/A"}</TableCell>
                        <TableCell className="text-white">{aluno.escola_nome || "Não informado"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        {filtroEscola === "todas" ? "Nenhum aluno encontrado" : "Nenhum aluno encontrado para esta escola"}
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

// Componente para o card de total de turmas
export function TotalTurmasCard() {
  const { toast } = useToast();
  const [totalTurmas, setTotalTurmas] = useState<number>(0);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Requisição API: GET /api/turmas', '');
        
        const response = await apiRequest("GET", "/api/gestor/turmas");
        
        console.log('Resposta GET /api/turmas: status', response.status);
        
        const data = await response.json();
        
        console.log('Turmas recebidas:', data);
        
        // Ajustar formato de resposta conforme a API do dashboard
        setTotalTurmas(data.total || 0);
        setTurmas(data.turmas || []);
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        toast({
          title: "Erro ao carregar turmas",
          description: "Não foi possível carregar as informações de turmas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
            <div className="text-xs text-accent mt-1">Nas escolas vinculadas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalTurmas === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
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
                {turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <TableRow key={turma.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{turma.nome}</TableCell>
                      <TableCell className="text-white">{turma.serie}</TableCell>
                      <TableCell className="text-white">{turma.turno}</TableCell>
                      <TableCell className="text-white">{turma.ano_letivo}</TableCell>
                      <TableCell className="text-white">{turma.total_alunos}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhuma turma encontrada
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