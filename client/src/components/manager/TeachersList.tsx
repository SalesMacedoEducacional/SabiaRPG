import { useState, useEffect } from 'react';
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
import { Search, Eye, Edit, Plus, User } from 'lucide-react';

interface Teacher {
  id: string;
  usuarios: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
  };
  escola_nome: string;
  disciplinas: string[];
  ativo: boolean;
}

interface TeachersResponse {
  total: number;
  professores: Teacher[];
}

export default function TeachersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');

  const { data: teachersData, isLoading, error } = useQuery<TeachersResponse>({
    queryKey: ['/api/teachers/manager']
  });

  const { data: schoolsData } = useQuery<any>({
    queryKey: ['/api/escolas/gestor']
  });

  const filteredTeachers = teachersData?.professores?.filter(teacher => {
    const matchesSearch = teacher.usuarios.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.usuarios.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.usuarios.cpf.includes(searchTerm);
    
    const matchesSchool = selectedSchool === 'all' || teacher.escola_nome === selectedSchool;
    
    return matchesSearch && matchesSchool;
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
          <p className="text-destructive">Erro ao carregar professores</p>
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
            <User className="text-accent" size={24} />
            Professores
          </h1>
          <p className="text-white/70">
            Gerencie os professores das suas escolas
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/80 text-primary">
          <Plus size={16} className="mr-2" />
          Novo Professor
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#2a2520] border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
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
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{teachersData?.total || 0}</p>
              <p className="text-white/70">Total de Professores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {filteredTeachers.filter(t => t.ativo).length}
              </p>
              <p className="text-white/70">Professores Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">
                {filteredTeachers.filter(t => !t.ativo).length}
              </p>
              <p className="text-white/70">Professores Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-[#2a2520] border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">
            Lista de Professores ({filteredTeachers.length})
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
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Disciplinas</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-white/70 py-8">
                      Nenhum professor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="text-white font-medium">
                        {teacher.usuarios.nome}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {teacher.usuarios.email}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {teacher.usuarios.cpf}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {teacher.escola_nome}
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div className="flex flex-wrap gap-1">
                          {teacher.disciplinas?.slice(0, 2).map((disciplina, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {disciplina}
                            </Badge>
                          ))}
                          {teacher.disciplinas?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{teacher.disciplinas.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={teacher.ativo ? "default" : "secondary"}
                          className={teacher.ativo ? "bg-green-600" : "bg-gray-600"}
                        >
                          {teacher.ativo ? "Ativo" : "Inativo"}
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