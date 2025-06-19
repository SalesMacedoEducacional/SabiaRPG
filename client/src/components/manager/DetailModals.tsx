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
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar
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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Modal de detalhes das escolas
export function EscolasDetailModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [escolas, setEscolas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEscolas = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/escolas/detalhes");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setEscolas(data.escolas || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      toast({
        title: "Erro ao carregar escolas",
        description: "Não foi possível carregar os detalhes das escolas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEscolas();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#312e26] border-[#D47C06] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center">
            <School className="h-5 w-5 mr-2" /> Escolas Cadastradas
          </DialogTitle>
          <DialogDescription className="text-accent">
            Lista completa das escolas sob sua gestão
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Endereço</TableHead>
                  <TableHead className="text-white">Município</TableHead>
                  <TableHead className="text-white">Estado</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolas.length > 0 ? (
                  escolas.map((escola) => (
                    <TableRow key={escola.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{escola.nome}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-primary" />
                          {escola.telefone || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center max-w-xs">
                          <MapPin className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                          <span className="truncate">{escola.endereco_completo || escola.endereco || "Não informado"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{escola.cidade || "Não informado"}</TableCell>
                      <TableCell className="text-white">{escola.estado || "Não informado"}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-primary" />
                          {escola.email_institucional || escola.email || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge variant="default" className="bg-green-600">
                          Ativa
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhuma escola encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Modal de detalhes dos professores
export function ProfessoresDetailModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/professores/detalhes");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setProfessores(data.professores || []);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast({
        title: "Erro ao carregar professores",
        description: "Não foi possível carregar os detalhes dos professores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfessores();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#312e26] border-[#D47C06] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center">
            <Users className="h-5 w-5 mr-2" /> Professores Cadastrados
          </DialogTitle>
          <DialogDescription className="text-accent">
            Lista completa dos professores cadastrados no sistema
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professores.length > 0 ? (
                  professores.map((professor) => (
                    <TableRow key={professor.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{professor.nome}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-primary" />
                          {professor.email || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{professor.cpf || "Não informado"}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-primary" />
                          {professor.telefone || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{professor.escola_nome || "Não vinculado"}</TableCell>
                      <TableCell className="text-white">
                        <Badge variant="default" className="bg-green-600">
                          Ativo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhum professor encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Modal de detalhes dos alunos
export function AlunosDetailModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/alunos/detalhes");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setAlunos(data.alunos || []);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast({
        title: "Erro ao carregar alunos",
        description: "Não foi possível carregar os detalhes dos alunos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlunos();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#312e26] border-[#D47C06] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" /> Alunos Matriculados
          </DialogTitle>
          <DialogDescription className="text-accent">
            Lista completa dos alunos cadastrados no sistema
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Matrícula</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.length > 0 ? (
                  alunos.map((aluno) => (
                    <TableRow key={aluno.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{aluno.usuarios.nome}</TableCell>
                      <TableCell className="text-white">{aluno.usuarios.email || "Não informado"}</TableCell>
                      <TableCell className="text-white">{aluno.matriculas?.numero_matricula || "Não informado"}</TableCell>
                      <TableCell className="text-white">{aluno.usuarios.telefone || "Não informado"}</TableCell>
                      <TableCell className="text-white">{aluno.escola_nome || "Não definida"}</TableCell>
                      <TableCell className="text-white">
                        <Badge variant={aluno.ativo ? "default" : "secondary"}>
                          {aluno.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Modal de detalhes das turmas
export function TurmasDetailModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/turmas/detalhes");
      const data = await response.json();
      setTurmas(data.turmas || []);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      toast({
        title: "Erro ao carregar turmas",
        description: "Não foi possível carregar os detalhes das turmas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTurmas();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#312e26] border-[#D47C06] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center">
            <BookOpen className="h-5 w-5 mr-2" /> Turmas Ativas
          </DialogTitle>
          <DialogDescription className="text-accent">
            Lista completa das turmas das escolas sob sua gestão
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <Table className="border-collapse">
              <TableHeader className="bg-[#43341c]">
                <TableRow>
                  <TableHead className="text-white">Nome da Turma</TableHead>
                  <TableHead className="text-white">Série</TableHead>
                  <TableHead className="text-white">Ano Letivo</TableHead>
                  <TableHead className="text-white">Turno</TableHead>
                  <TableHead className="text-white">Modalidade</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Capacidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <TableRow key={turma.id} className="hover:bg-[#43341c]">
                      <TableCell className="text-white font-medium">{turma.nome}</TableCell>
                      <TableCell className="text-white">{turma.serie || "Não informado"}</TableCell>
                      <TableCell className="text-white">{turma.ano_letivo || "Não informado"}</TableCell>
                      <TableCell className="text-white">{turma.turno || "Não informado"}</TableCell>
                      <TableCell className="text-white">{turma.modalidade || "Não informado"}</TableCell>
                      <TableCell className="text-white">{turma.escola_nome}</TableCell>
                      <TableCell className="text-white">{turma.capacidade_maxima || "Não definida"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhuma turma encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}