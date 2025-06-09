import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Plus, GraduationCap } from 'lucide-react';

interface Student {
  id: string;
  usuario_id: string;
  usuarios: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
  };
  turmas: {
    id: string;
    nome: string;
    serie: string;
    turno: string;
  };
  escola_nome: string;
  escola_cidade: string;
  escola_estado: string;
  numero_matricula: string;
  data_matricula: string;
  serie: string;
  turno: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  responsavel_email: string;
  endereco: string;
  data_nascimento: string;
  observacoes: string;
  ativo: boolean;
  criado_em: string;
}

interface StudentsResponse {
  total: number;
  alunos: Student[];
}

export default function StudentsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  const { data: studentsData, isLoading, error } = useQuery<StudentsResponse>({
    queryKey: ['/api/students/manager']
  });

  const { data: schoolsData } = useQuery<any>({
    queryKey: ['/api/escolas/gestor']
  });

  const { data: classesData } = useQuery<any>({
    queryKey: ['/api/turmas']
  });

  const filteredStudents = studentsData?.alunos?.filter(student => {
    const matchesSearch = (student?.usuarios?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student?.usuarios?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student?.usuarios?.cpf || '').includes(searchTerm) ||
                         (student?.numero_matricula || '').includes(searchTerm);
    
    const matchesSchool = selectedSchool === 'all' || (student?.escola_nome || '') === selectedSchool;
    const matchesClass = selectedClass === 'all' || (student?.turmas?.nome || '') === selectedClass;
    
    return matchesSearch && matchesSchool && matchesClass;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Erro ao carregar alunos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="text-accent" size={24} />
            Alunos
          </h1>
          <p className="text-white/70">
            Gerencie os alunos das suas escolas
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/80 text-primary">
          <Plus size={16} className="mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#2a2520] border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
              <Input
                placeholder="Buscar por nome, email, CPF ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#312e26] border-primary/30 text-white"
              />
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#312e26] border-primary/30 text-white">
                <SelectValue placeholder="Filtrar por escola" />
              </SelectTrigger>
              <SelectContent className="bg-[#312e26] border-primary/30">
                <SelectItem value="all">Todas as escolas</SelectItem>
                {Array.isArray(schoolsData) && schoolsData?.map((school: any) => (
                  <SelectItem key={school.id} value={school.nome}>
                    {school.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#312e26] border-primary/30 text-white">
                <SelectValue placeholder="Filtrar por turma" />
              </SelectTrigger>
              <SelectContent className="bg-[#312e26] border-primary/30">
                <SelectItem value="all">Todas as turmas</SelectItem>
                {Array.isArray(classesData) && classesData?.map((turma: any) => (
                  <SelectItem key={turma.id} value={turma.nome}>
                    {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{studentsData?.total || 0}</p>
              <p className="text-white/70">Total de Alunos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {filteredStudents.length}
              </p>
              <p className="text-white/70">Alunos Filtrados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {new Set(filteredStudents.map(s => s.turmas.id)).size}
              </p>
              <p className="text-white/70">Turmas Representadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-[#2a2520] border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">
            Lista de Alunos ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-primary/20">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20 hover:bg-primary/5">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Matrícula</TableHead>
                  <TableHead className="text-white">Turma</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Responsável</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-white/70 py-8">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="text-white font-medium">
                        <div>
                          <div>{student.usuarios.nome}</div>
                          <div className="text-xs text-white/50">{student.usuarios.cpf}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div>
                          <div>{student.usuarios.email}</div>
                          <div className="text-xs text-white/50">{student.usuarios.telefone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <Badge variant="outline" className="text-accent border-accent">
                          {student.numero_matricula || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div>
                          <div>{student.turmas?.nome || 'Não vinculado'}</div>
                          <div className="text-xs text-white/50">
                            {student.serie} - {student.turno}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div>
                          <div>{student.escola_nome}</div>
                          <div className="text-xs text-white/50">{student.escola_cidade}, {student.escola_estado}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div>
                          <div className="text-sm">{student.responsavel_nome}</div>
                          <div className="text-xs text-white/50">{student.responsavel_telefone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={student.ativo ? "default" : "secondary"}
                          className={student.ativo ? "bg-green-600" : "bg-gray-600"}
                        >
                          {student.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-white hover:text-accent">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-white hover:text-accent">
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}