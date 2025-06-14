import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search,
  Loader2,
  Edit,
  Trash2
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

// Interfaces baseadas na estrutura real do banco
interface DashboardData {
  escolas: Array<{
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
  }>;
  turmas: Array<{
    id: string;
    nome: string;
    ano_letivo: string;
    turno: string;
    modalidade: string;
    serie: string;
    descricao: string;
    escola_id: string;
    ativo: boolean;
  }>;
  professores: Array<{
    id: string;
    nome: string;
    email: string;
    papel: string;
    cpf: string;
    telefone: string;
    ativo: boolean;
  }>;
  alunos: Array<{
    id: string;
    nome: string;
    email: string;
    papel: string;
    cpf: string;
    telefone: string;
    ativo: boolean;
  }>;
  resumo: {
    totalEscolas: number;
    totalTurmas: number;
    totalProfessores: number;
    totalAlunos: number;
  };
}

// Hook personalizado para gerenciar dados do dashboard
function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/gestor/dashboard-completo");
      setData(response as DashboardData);
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

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}

// Card de Escolas
export function EscolasCard() {
  const { data, loading } = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);

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
              {data?.resumo?.totalEscolas || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {data?.resumo?.totalEscolas || 0} ativas
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!data?.escolas?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Escolas Vinculadas</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Código</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white">Cidade</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.escolas?.map((escola) => (
                  <TableRow key={escola.id} className="border-[#4a4639] text-white">
                    <TableCell className="font-medium">{escola.nome}</TableCell>
                    <TableCell>{escola.codigo_escola}</TableCell>
                    <TableCell>{escola.tipo}</TableCell>
                    <TableCell>{escola.cidade}, {escola.estado}</TableCell>
                    <TableCell>{escola.telefone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-400">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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

// Card de Turmas
export function TurmasCard() {
  const { data, loading } = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);

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
              {data?.resumo?.totalTurmas || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {data?.resumo?.totalTurmas || 0} turmas
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!data?.turmas?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Turmas Ativas</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Série</TableHead>
                  <TableHead className="text-white">Turno</TableHead>
                  <TableHead className="text-white">Ano Letivo</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.turmas?.map((turma) => (
                  <TableRow key={turma.id} className="border-[#4a4639] text-white">
                    <TableCell className="font-medium">{turma.nome}</TableCell>
                    <TableCell>{turma.serie}</TableCell>
                    <TableCell>{turma.turno}</TableCell>
                    <TableCell>{turma.ano_letivo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        turma.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {turma.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-400">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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

// Card de Professores
export function ProfessoresCard() {
  const { data, loading } = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);

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
              {data?.resumo?.totalProfessores || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {data?.resumo?.totalProfessores || 0} ativos
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!data?.professores?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Professores Cadastrados</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.professores?.map((professor) => (
                  <TableRow key={professor.id} className="border-[#4a4639] text-white">
                    <TableCell className="font-medium">{professor.nome}</TableCell>
                    <TableCell>{professor.email}</TableCell>
                    <TableCell>{professor.cpf}</TableCell>
                    <TableCell>{professor.telefone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        professor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {professor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-400">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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

// Card de Alunos
export function AlunosCard() {
  const { data, loading } = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);

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
              {data?.resumo?.totalAlunos || 0}
            </div>
            <div className="text-xs text-accent mt-1">
              {data?.resumo?.totalAlunos || 0} ativos
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#4a4639] border border-[#D47C06] text-white px-3 py-1.5 mt-3 rounded hover:bg-[#57533f] transition-colors self-start"
              onClick={() => setModalOpen(true)}
              disabled={!data?.alunos?.length}
            >
              <Search className="h-3 w-3 mr-1" /> Ver Detalhes
            </Button>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#312e26] border-[#D47C06]">
          <DialogHeader>
            <DialogTitle className="text-white">Alunos Cadastrados</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4a4639]">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.alunos?.map((aluno) => (
                  <TableRow key={aluno.id} className="border-[#4a4639] text-white">
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell>{aluno.email}</TableCell>
                    <TableCell>{aluno.cpf}</TableCell>
                    <TableCell>{aluno.telefone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        aluno.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-400">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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

// Componente principal que renderiza todos os cards
export default function DashboardCardsReal() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <EscolasCard />
      <TurmasCard />
      <ProfessoresCard />
      <AlunosCard />
    </div>
  );
}