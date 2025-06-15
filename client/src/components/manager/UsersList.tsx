import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Eye, Edit, Plus, Users, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  papel: string;
  escola_nome: string;
  ativo: boolean;
  criado_em: string;
  telefone?: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface UsersResponse {
  total: number;
  usuarios: User[];
}

const editUserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  ativo: z.boolean(),
});

type EditUserForm = z.infer<typeof editUserSchema>;

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: usersData, isLoading, error, refetch } = useQuery<UsersResponse>({
    queryKey: ['/api/users/manager'],
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    gcTime: 0, // Remove do cache imediatamente
    refetchInterval: false,
    retry: false,
  });

  const { data: schoolsData } = useQuery<any>({
    queryKey: ['/api/escolas/gestor']
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      ativo: true,
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; userData: EditUserForm }) => {
      console.log('Enviando dados para atualização:', data);
      const result = await apiRequest('PUT', `/api/users/${data.id}`, data.userData);
      console.log('Resposta da API de atualização:', result);
      return result;
    },
    onSuccess: async (data, variables) => {
      console.log('Atualização bem-sucedida');
      
      // Forçar atualização imediata dos dados
      queryClient.setQueryData(['/api/users/manager'], (oldData: UsersResponse | undefined) => {
        if (!oldData) return oldData;
        
        const updatedUsers = oldData.usuarios.map(user => 
          user.id === variables.id 
            ? { ...user, ...variables.userData }
            : user
        );
        
        return { ...oldData, usuarios: updatedUsers };
      });
      
      // Invalidar cache e recarregar dados do servidor
      await queryClient.invalidateQueries({ queryKey: ['/api/users/manager'] });
      
      setShowEditDialog(false);
      setEditUser(null);
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: async (data, userId) => {
      console.log('Exclusão bem-sucedida');
      
      // Forçar atualização imediata dos dados
      queryClient.setQueryData(['/api/users/manager'], (oldData: UsersResponse | undefined) => {
        if (!oldData) return oldData;
        
        const filteredUsers = oldData.usuarios.filter(user => user.id !== userId);
        
        return { 
          ...oldData, 
          usuarios: filteredUsers,
          total: filteredUsers.length 
        };
      });
      
      // Invalidar cache e recarregar dados do servidor
      await queryClient.invalidateQueries({ queryKey: ['/api/users/manager'] });
      
      setShowDeleteDialog(false);
      setUserToDelete(null);
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = usersData?.usuarios?.filter(user => {
    const matchesSearch = (user?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user?.cpf || '').includes(searchTerm);
    
    const matchesSchool = selectedSchool === 'all' || (user?.escola_nome || '') === selectedSchool;
    const matchesRole = selectedRole === 'all' || (user?.papel || '') === selectedRole;
    
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

  const handleViewUser = (user: User) => {
    setViewUser(user);
    setShowViewDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    editForm.reset({
      nome: user.nome || "",
      email: user.email || "",
      telefone: user.telefone || "",
      cpf: user.cpf || "",
      ativo: user.ativo,
    });
    setShowEditDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const onSubmitEdit = (data: EditUserForm) => {
    if (editUser) {
      updateUserMutation.mutate({
        id: editUser.id,
        userData: data,
      });
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
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
        <Button 
          className="bg-[#C5A572] hover:bg-[#B3956A] text-white border border-[#D4A054] shadow-md transition-colors"
          onClick={() => setLocation('/user-registration')}
        >
          <Plus size={16} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

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
              <p className="text-2xl font-bold text-green-400">
                {filteredUsers.filter(u => u.papel === 'aluno').length}
              </p>
              <p className="text-white/70">Alunos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {filteredUsers.filter(u => u.papel === 'gestor').length}
              </p>
              <p className="text-white/70">Gestores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {filteredUsers.filter(u => !u.ativo).length}
              </p>
              <p className="text-white/70">Usuários Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2a2520] border-primary/20 text-white placeholder:text-white/50"
          />
        </div>
        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
          <SelectTrigger className="w-full md:w-48 bg-[#2a2520] border-primary/20 text-white">
            <SelectValue placeholder="Todas as escolas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as escolas</SelectItem>
            {schoolsData?.map((school: any) => (
              <SelectItem key={school.id} value={school.nome}>
                {school.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full md:w-48 bg-[#2a2520] border-primary/20 text-white">
            <SelectValue placeholder="Todos os papéis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="gestor">Gestor</SelectItem>
            <SelectItem value="professor">Professor</SelectItem>
            <SelectItem value="aluno">Aluno</SelectItem>
          </SelectContent>
        </Select>
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
                        {user.nome || 'Nome não informado'}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {user.email || 'Email não informado'}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {user.cpf || '000.000.000-00'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.papel)} text-white`}>
                          {getRoleLabel(user.papel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {user.escola_nome || 'Geral'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.ativo ? 'bg-green-400' : 'bg-red-400'}`} />
                          <Badge variant={user.ativo ? "default" : "secondary"} className={user.ativo ? "bg-green-600" : "bg-red-600"}>
                            {user.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {new Date(user.criado_em).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white/70 hover:text-accent hover:bg-primary/10 h-8 w-8 p-0"
                            onClick={() => handleViewUser(user)}
                            title="Visualizar usuário"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white/70 hover:text-accent hover:bg-primary/10 h-8 w-8 p-0"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuário"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white/70 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 p-0"
                            onClick={() => handleDeleteUser(user)}
                            title="Excluir usuário"
                          >
                            <Trash2 size={16} />
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

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-[#2a2520] border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/70">Nome</label>
                  <p className="text-white">{viewUser.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">Email</label>
                  <p className="text-white">{viewUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">CPF</label>
                  <p className="text-white">{viewUser.cpf}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">Telefone</label>
                  <p className="text-white">{viewUser.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">Papel</label>
                  <Badge className={`${getRoleBadgeColor(viewUser.papel)} text-white`}>
                    {getRoleLabel(viewUser.papel)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">Status</label>
                  <Badge variant={viewUser.ativo ? "default" : "secondary"} className={viewUser.ativo ? "bg-green-600" : "bg-red-600"}>
                    {viewUser.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">Escola</label>
                  <p className="text-white">{viewUser.escola_nome || 'Geral'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">Criado em</label>
                  <p className="text-white">{new Date(viewUser.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#2a2520] border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#1a1713] border-primary/20 text-white placeholder:text-white/50" placeholder="Digite o nome completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-[#1a1713] border-primary/20 text-white placeholder:text-white/50" placeholder="exemplo@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">CPF</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#1a1713] border-primary/20 text-white placeholder:text-white/50" placeholder="000.000.000-00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#1a1713] border-primary/20 text-white placeholder:text-white/50" placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Campos removidos para simplificar e corrigir TypeScript */}
                <FormField
                  control={editForm.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-primary/20 p-4 bg-[#1a1713]">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white font-medium">Status do Usuário</FormLabel>
                        <div className="text-sm text-white/70">
                          Usuário ativo no sistema
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 accent-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="border-primary/30 text-white hover:bg-primary/10 font-medium px-6 py-2"
                  disabled={updateUserMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-primary font-medium px-6 py-2"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#2a2520] border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/70">
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.nome}</strong>?
            </p>
            <p className="text-red-400 text-sm mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-primary/30 text-white hover:bg-primary/10 font-medium px-6 py-2"
              disabled={deleteUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}