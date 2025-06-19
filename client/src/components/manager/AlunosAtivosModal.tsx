import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Search, Filter, BarChart3 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlunoAtivo {
  id: string;
  nome: string;
  email: string;
  escola_nome: string;
  turma_nome: string;
  ultimo_login: string;
  total_logins: number;
}

interface AlunosAtivosModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    ativos7Dias: number;
    ativos30Dias: number;
    taxaEngajamento: number;
    totalAlunos: number;
  };
}

export function AlunosAtivosModal({ isOpen, onClose, stats }: AlunosAtivosModalProps) {
  const [alunos, setAlunos] = useState<AlunoAtivo[]>([]);
  const [filteredAlunos, setFilteredAlunos] = useState<AlunoAtivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState("7");
  const [escolaFilter, setEscolaFilter] = useState("");
  const [turmaFilter, setTurmaFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [escolas, setEscolas] = useState<string[]>([]);
  const [turmas, setTurmas] = useState<string[]>([]);

  const fetchAlunosAtivos = async () => {
    setLoading(true);
    try {
      const response: any = await apiRequest(`/api/alunos-ativos/detalhes?periodo=${periodo}`, {
        method: 'GET'
      });
      
      if (response && response.alunos) {
        const alunosData = response.alunos as AlunoAtivo[];
        setAlunos(alunosData);
        setFilteredAlunos(alunosData);
        
        // Extrair escolas e turmas únicas para filtros
        const escolasUnicas = Array.from(new Set(alunosData.map(a => a.escola_nome)));
        const turmasUnicas = Array.from(new Set(alunosData.map(a => a.turma_nome).filter(Boolean)));
        setEscolas(escolasUnicas);
        setTurmas(turmasUnicas);
      }
    } catch (error) {
      console.error('Erro ao buscar alunos ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...alunos];

    if (escolaFilter) {
      filtered = filtered.filter(aluno => aluno.escola_nome === escolaFilter);
    }

    if (turmaFilter) {
      filtered = filtered.filter(aluno => aluno.turma_nome === turmaFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(aluno => 
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlunos(filtered);
  }, [alunos, escolaFilter, turmaFilter, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchAlunosAtivos();
    }
  }, [isOpen, periodo]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const limparFiltros = () => {
    setEscolaFilter("");
    setTurmaFilter("");
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Alunos Ativos - Detalhes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Últimos 7 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.ativos7Dias}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Últimos 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.ativos30Dias}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.taxaEngajamento}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.totalAlunos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Escola</label>
              <Select value={escolaFilter} onValueChange={setEscolaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as escolas</SelectItem>
                  {escolas.map(escola => (
                    <SelectItem key={escola} value={escola}>{escola}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Turma</label>
              <Select value={turmaFilter} onValueChange={setTurmaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as turmas</SelectItem>
                  {turmas.map(turma => (
                    <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button variant="outline" onClick={limparFiltros} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Tabela de alunos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Alunos Ativos ({filteredAlunos.length})
              </CardTitle>
              <CardDescription>
                Período: {periodo === "7" ? "Últimos 7 dias" : periodo === "30" ? "Últimos 30 dias" : "Últimos 90 dias"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Carregando alunos ativos...</span>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead>Turma</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Total Logins</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlunos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <User className="w-12 h-12 text-gray-400" />
                              <span className="text-gray-500">Nenhum aluno ativo encontrado</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAlunos.map((aluno) => (
                          <TableRow key={aluno.id}>
                            <TableCell className="font-medium">{aluno.nome}</TableCell>
                            <TableCell>{aluno.email}</TableCell>
                            <TableCell>{aluno.escola_nome}</TableCell>
                            <TableCell>{aluno.turma_nome || "Não informado"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatDate(aluno.ultimo_login)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{aluno.total_logins}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Ativo
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}