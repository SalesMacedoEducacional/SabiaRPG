import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Search, Eye, Edit, Plus, Users, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  papel: string;
  escola_nome: string;
  ativo: boolean;
  criado_em: string;
}

interface UsersResponse {
  total: number;
  usuarios: User[];
}

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  const { data: usersData, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['/api/users/manager']
  });

  const { data: schoolsData } = useQuery<any>({
    queryKey: ['/api/escolas/gestor']
  });

  const filteredUsers = usersData?.usuarios?.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cpf.includes(searchTerm);
    
    const matchesSchool = selectedSchool === 'all' || user.escola_nome === selectedSchool;
    const matchesRole = selectedRole === 'all' || user.papel === selectedRole;
    
    return matchesSearch && matchesSchool && matchesRole;
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'gestor':
        return 'bg-purple-600';
      case 'professor':
        return 'bg-blue-600';
      case 'aluno':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gestor':
        return 'Gestor';
      case 'professor':
        return 'Professor';
      case 'aluno':
        return 'Aluno';
      default:
        return role;
    }
  };

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
          <p className="text-destructive">Erro ao carregar usuários</p>
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
            <Users className="text-accent" size={24} />
            Usuários
          </h1>
          <p className="text-white/70">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/80 text-primary">
          <Plus size={16} className="mr-2" />
          Novo Usuário
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
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#312e26] border-primary/30 text-white">
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent className="bg-[#312e26] border-primary/30">
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{usersData?.total || 0}</p>
              <p className="text-white/70">Total de Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {filteredUsers.filter(u => u.ativo).length}
              </p>
              <p className="text-white/70">Usuários Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {filteredUsers.filter(u => u.papel === 'professor').length}
              </p>
              <p className="text-white/70">Professores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {filteredUsers.filter(u => u.papel === 'aluno').length}
              </p>
              <p className="text-white/70">Alunos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-[#2a2520] border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">
            Lista de Usuários ({filteredUsers.length})
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
                  <TableHead className="text-white">Papel</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Criado em</TableHead>
                  <TableHead className="text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-white/70 py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="text-white font-medium">
                        {user.nome}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {user.cpf}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getRoleBadgeColor(user.papel)} text-white`}
                        >
                          {getRoleLabel(user.papel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {user.escola_nome}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.ativo ? (
                            <UserCheck className="text-green-400" size={16} />
                          ) : (
                            <UserX className="text-red-400" size={16} />
                          )}
                          <Badge 
                            variant={user.ativo ? "default" : "secondary"}
                            className={user.ativo ? "bg-green-600" : "bg-gray-600"}
                          >
                            {user.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {new Date(user.criado_em).toLocaleDateString('pt-BR')}
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