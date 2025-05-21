import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search,
  Building
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
    nome_completo: string;
    cpf: string;
    telefone: string;
  };
}

interface Aluno {
  id: string;
  usuarios: {
    nome_completo: string;
  };
  turmas: {
    nome: string;
  };
  matriculas: {
    numero_matricula: string;
  };
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/escolas");
        const data = await response.json();
        
        setTotalEscolas(data.total || 0);
        setEscolas(data.escolas || []);
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

  return (
    <>
      <div className="bg-light border border-accent rounded-md p-4 flex flex-col hover:border-accent/80 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-light-2 p-2 mr-3">
            <School className="h-5 w-5 text-accent" />
          </div>
          <div className="text-sm font-medium text-base">Total de Escolas Vinculadas</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-base mt-2">{totalEscolas}</div>
            <div className="text-xs text-muted mt-1">{totalEscolas} ativas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-light-2 border border-accent text-base px-3 py-1.5 mt-3 rounded hover:bg-light/80 transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalEscolas === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-light border-accent text-base">
          <DialogHeader>
            <DialogTitle className="text-xl text-accent flex items-center">
              <School className="h-5 w-5 mr-2" /> Escolas Vinculadas
            </DialogTitle>
            <DialogDescription className="text-muted">
              Lista de escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-light-2 border-b border-primary/30">
                <TableRow>
                  <TableHead className="text-base font-semibold">Nome da Escola</TableHead>
                  <TableHead className="text-base font-semibold">Cidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolas.length > 0 ? (
                  escolas.map((escola) => (
                    <TableRow key={escola.id} className="hover:bg-light-2 border-b border-primary/20">
                      <TableCell className="text-base font-medium">{escola.nome}</TableCell>
                      <TableCell className="text-base">{escola.cidades?.nome || escola.cidade}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-muted">
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
  const [totalProfessores, setTotalProfessores] = useState<number>(0);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/professores");
        const data = await response.json();
        
        setTotalProfessores(data.total || 0);
        setProfessores(data.professores || []);
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
      <div className="bg-light border border-accent rounded-md p-4 flex flex-col hover:border-accent/80 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-light-2 p-2 mr-3">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div className="text-sm font-medium text-base">Total de Professores</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-base mt-2">{totalProfessores}</div>
            <div className="text-xs text-muted mt-1">Em todas as escolas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-light-2 border border-accent text-base px-3 py-1.5 mt-3 rounded hover:bg-light/80 transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalProfessores === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-light border-accent text-base">
          <DialogHeader>
            <DialogTitle className="text-xl text-accent flex items-center">
              <Users className="h-5 w-5 mr-2" /> Professores Cadastrados
            </DialogTitle>
            <DialogDescription className="text-muted">
              Lista de professores nas escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-light-2 border-b border-primary/30">
                <TableRow>
                  <TableHead className="text-base font-semibold">Nome do Professor</TableHead>
                  <TableHead className="text-base font-semibold">CPF</TableHead>
                  <TableHead className="text-base font-semibold">Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professores.length > 0 ? (
                  professores.map((professor) => (
                    <TableRow key={professor.id} className="hover:bg-light-2 border-b border-primary/20">
                      <TableCell className="text-base font-medium">{professor.usuarios.nome_completo}</TableCell>
                      <TableCell className="text-base">{professor.usuarios.cpf}</TableCell>
                      <TableCell className="text-base">{professor.usuarios.telefone || "Não informado"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted">
                      Nenhum professor encontrado
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

// Componente para o card de total de alunos
export function TotalAlunosCard() {
  const { toast } = useToast();
  const [totalAlunos, setTotalAlunos] = useState<number>(0);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/alunos");
        const data = await response.json();
        
        setTotalAlunos(data.total || 0);
        setAlunos(data.alunos || []);
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
      <div className="bg-light border border-accent rounded-md p-4 flex flex-col hover:border-accent/80 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-light-2 p-2 mr-3">
            <GraduationCap className="h-5 w-5 text-accent" />
          </div>
          <div className="text-sm font-medium text-base">Total de Alunos</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-base mt-2">{totalAlunos}</div>
            <div className="text-xs text-muted mt-1">Em todas as escolas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-light-2 border border-accent text-base px-3 py-1.5 mt-3 rounded hover:bg-light/80 transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalAlunos === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-light border-accent text-base">
          <DialogHeader>
            <DialogTitle className="text-xl text-accent flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" /> Alunos Matriculados
            </DialogTitle>
            <DialogDescription className="text-muted">
              Lista de alunos nas escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-light-2 border-b border-primary/30">
                <TableRow>
                  <TableHead className="text-base font-semibold">Nome do Aluno</TableHead>
                  <TableHead className="text-base font-semibold">Nº Matrícula</TableHead>
                  <TableHead className="text-base font-semibold">Turma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.length > 0 ? (
                  alunos.map((aluno) => (
                    <TableRow key={aluno.id} className="hover:bg-light-2 border-b border-primary/20">
                      <TableCell className="text-base font-medium">{aluno.usuarios.nome_completo}</TableCell>
                      <TableCell className="text-base">{aluno.matriculas?.numero_matricula || "N/A"}</TableCell>
                      <TableCell className="text-base">{aluno.turmas?.nome || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted">
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
  const [totalTurmas, setTotalTurmas] = useState<number>(0);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/turmas");
        const data = await response.json();
        
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
      <div className="bg-light border border-accent rounded-md p-4 flex flex-col hover:border-accent/80 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-light-2 p-2 mr-3">
            <BookOpen className="h-5 w-5 text-accent" />
          </div>
          <div className="text-sm font-medium text-base">Turmas Ativas</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-base mt-2">{totalTurmas}</div>
            <div className="text-xs text-muted mt-1">Distribuídas em todas as escolas</div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-light-2 border border-accent text-base px-3 py-1.5 mt-3 rounded hover:bg-light/80 transition-colors self-start"
              onClick={() => setIsModalOpen(true)}
              disabled={totalTurmas === 0}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-light border-accent text-base">
          <DialogHeader>
            <DialogTitle className="text-xl text-accent flex items-center">
              <BookOpen className="h-5 w-5 mr-2" /> Turmas Ativas
            </DialogTitle>
            <DialogDescription className="text-muted">
              Lista de turmas nas escolas sob sua gestão
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-light-2 border-b border-primary/30">
                <TableRow>
                  <TableHead className="text-base font-semibold">Nome</TableHead>
                  <TableHead className="text-base font-semibold">Série</TableHead>
                  <TableHead className="text-base font-semibold">Turno</TableHead>
                  <TableHead className="text-base font-semibold">Ano Letivo</TableHead>
                  <TableHead className="text-base font-semibold">Total de Alunos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <TableRow key={turma.id} className="hover:bg-light-2 border-b border-primary/20">
                      <TableCell className="text-base font-medium">{turma.nome}</TableCell>
                      <TableCell className="text-base">{turma.serie}</TableCell>
                      <TableCell className="text-base">{turma.turno}</TableCell>
                      <TableCell className="text-base">{turma.ano_letivo}</TableCell>
                      <TableCell className="text-base">{turma.total_alunos}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted">
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