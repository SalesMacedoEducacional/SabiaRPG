import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Interfaces baseadas nos dados reais do banco
interface EscolaReal {
  id: string;
  nome: string;
  codigo_escola: string;
  tipo: string;
  modalidade_ensino: string;
  cidade: string;
  estado: string;
  endereco_completo: string;
  telefone: string;
  email_institucional: string;
}

interface TurmaReal {
  id: string;
  nome: string;
  ano_letivo: string;
  turno: string;
  modalidade: string;
  serie: string;
  descricao: string;
  escola_id: string;
  ativo: boolean;
}

interface UsuarioReal {
  id: string;
  nome: string;
  email: string;
  papel: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
}

interface DashboardRealData {
  escolas: EscolaReal[];
  turmas: TurmaReal[];
  professores: UsuarioReal[];
  alunos: UsuarioReal[];
  resumo: {
    totalEscolas: number;
    totalTurmas: number;
    totalProfessores: number;
    totalAlunos: number;
  };
}

// Card de Escolas com dados reais
export function CardEscolasReais() {
  const { toast } = useToast();
  const [dados, setDados] = useState<DashboardRealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/gestor/dashboard-completo");
        setDados(response);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [toast]);

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Escolas Vinculadas</div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">
              {dados?.resumo?.totalEscolas || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {dados?.resumo?.totalEscolas || 0} ativas
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!dados?.escolas?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Escolas Vinculadas</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white">Cidade</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados?.escolas?.map((escola) => (
                  <TableRow key={escola.id} className="border-[#4a4639] text-white">
                    <TableCell>{escola.nome}</TableCell>
                    <TableCell>{escola.tipo}</TableCell>
                    <TableCell>{escola.cidade}, {escola.estado}</TableCell>
                    <TableCell>{escola.telefone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Card de Turmas com dados reais
export function CardTurmasReais() {
  const { toast } = useToast();
  const [dados, setDados] = useState<DashboardRealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/gestor/dashboard-completo");
        setDados(response);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
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
        
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">
              {dados?.resumo?.totalTurmas || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {dados?.resumo?.totalTurmas || 0} turmas
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!dados?.turmas?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Turmas Ativas</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Série</TableHead>
                  <TableHead className="text-white">Turno</TableHead>
                  <TableHead className="text-white">Ano Letivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados?.turmas?.map((turma) => (
                  <TableRow key={turma.id} className="border-[#4a4639] text-white">
                    <TableCell>{turma.nome}</TableCell>
                    <TableCell>{turma.serie}</TableCell>
                    <TableCell>{turma.turno}</TableCell>
                    <TableCell>{turma.ano_letivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Card de Professores com dados reais
export function CardProfessoresReais() {
  const { toast } = useToast();
  const [dados, setDados] = useState<DashboardRealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/gestor/dashboard-completo");
        setDados(response);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [toast]);

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Professores</div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">
              {dados?.resumo?.totalProfessores || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {dados?.resumo?.totalProfessores || 0} ativos
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!dados?.professores?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Professores Cadastrados</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados?.professores?.map((professor) => (
                  <TableRow key={professor.id} className="border-[#4a4639] text-white">
                    <TableCell>{professor.nome}</TableCell>
                    <TableCell>{professor.email}</TableCell>
                    <TableCell>{professor.cpf}</TableCell>
                    <TableCell>{professor.telefone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Card de Alunos com dados reais
export function CardAlunosReais() {
  const { toast } = useToast();
  const [dados, setDados] = useState<DashboardRealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/gestor/dashboard-completo");
        setDados(response);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [toast]);

  return (
    <>
      <div className="bg-[#312e26] border border-[#D47C06] rounded-md p-4 flex flex-col hover:border-amber-400 transition-all shadow-md">
        <div className="flex items-center mb-2">
          <div className="rounded-full bg-[#4a4639] p-2 mr-3">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-white">Alunos</div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mt-2">
              {dados?.resumo?.totalAlunos || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {dados?.resumo?.totalAlunos || 0} ativos
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!dados?.alunos?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Alunos Cadastrados</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados?.alunos?.map((aluno) => (
                  <TableRow key={aluno.id} className="border-[#4a4639] text-white">
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell>{aluno.email}</TableCell>
                    <TableCell>{aluno.cpf}</TableCell>
                    <TableCell>{aluno.telefone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente principal que exibe todos os cards
export default function DashboardRealData() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <CardEscolasReais />
      <CardTurmasReais />
      <CardProfessoresReais />
      <CardAlunosReais />
    </div>
  );
}