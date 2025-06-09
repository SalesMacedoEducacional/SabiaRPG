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
  usuarios: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
  };
  turmas: {
    id: string;
    nome: string;
  };
  matriculas: {
    numero_matricula: string;
  }[];
  escola_nome: string;
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
    queryKey: ['/api/students/manager'],
    queryFn: () => apiRequest('/api/students/manager'),
  });

  const { data: schoolsData } = useQuery({
    queryKey: ['/api/escolas/gestor'],
    queryFn: () => apiRequest('/api/escolas/gestor'),
  });

  const { data: classesData } = useQuery({
    queryKey: ['/api/turmas'],
    queryFn: () => apiRequest('/api/turmas'),
  });

  const filteredStudents = studentsData?.alunos?.filter(student => {
    const matchesSearch = student.usuarios.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.usuarios.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.usuarios.cpf.includes(searchTerm) ||
                         student.matriculas?.[0]?.numero_matricula?.includes(searchTerm);
    
    const matchesSchool = selectedSchool === 'all' || student.escola_nome === selectedSchool;
    const matchesClass = selectedClass === 'all' || student.turmas.nome === selectedClass;
    
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
                {schoolsData?.map((school: any) => (
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
                {classesData?.map((turma: any) => (
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
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead className="text-white">Matrícula</TableHead>
                  <TableHead className="text-white">Turma</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-white/70 py-8">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="text-white font-medium">
                        {student.usuarios.nome}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {student.usuarios.email}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {student.usuarios.cpf}
                      </TableCell>
                      <TableCell className="text-white/70">
                        <Badge variant="outline" className="text-accent border-accent">
                          {student.matriculas?.[0]?.numero_matricula || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {student.turmas.nome}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {student.escola_nome}
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