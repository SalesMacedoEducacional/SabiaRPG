import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  papel_formatado: string;
  cpf: string | null;
  cpf_formatado: string | null;
  telefone: string | null;
  telefone_formatado: string | null;
  data_nascimento: string | null;
  ativo: boolean;
  criado_em: string;
  criado_em_formatado: string;
}

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("todos");
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const { toast } = useToast();

  // Carregar usuários do banco de dados
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/listar-usuarios');
      const data = await response.json();
      
      if (data.sucesso) {
        setUsuarios(data.usuarios);
        console.log(`${data.total} usuários carregados`);
      } else {
        throw new Error(data.erro || 'Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários com base na pesquisa e filtro de papel
  const filteredUsers = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (usuario.cpf_formatado && usuario.cpf_formatado.includes(searchTerm));
    
    const matchesRole = filterRole === "todos" || usuario.papel === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Contadores por papel
  const roleStats = {
    total: usuarios.length,
    gestores: usuarios.filter(u => u.papel === 'gestor').length,
    professores: usuarios.filter(u => u.papel === 'professor').length,
    alunos: usuarios.filter(u => u.papel === 'aluno').length,
  };

  // Função para obter a cor do badge do papel
  const getRoleBadgeColor = (papel: string) => {
    switch (papel) {
      case 'gestor': return 'bg-purple-100 text-purple-800';
      case 'professor': return 'bg-blue-100 text-blue-800';
      case 'aluno': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para mostrar detalhes do usuário
  const showUserDetailsModal = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowUserDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os usuários do sistema
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Usuários ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.gestores}</div>
            <p className="text-xs text-muted-foreground">
              Gestores escolares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.professores}</div>
            <p className="text-xs text-muted-foreground">
              Professores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.alunos}</div>
            <p className="text-xs text-muted-foreground">
              Alunos matriculados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsers.length} de {usuarios.length} usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os papéis</SelectItem>
                <SelectItem value="gestor">Gestores</SelectItem>
                <SelectItem value="professor">Professores</SelectItem>
                <SelectItem value="aluno">Alunos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de usuários */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(usuario.papel)}>
                        {usuario.papel_formatado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.telefone_formatado || '-'}
                    </TableCell>
                    <TableCell>{usuario.criado_em_formatado}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showUserDetailsModal(usuario)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
              <p className="text-sm text-gray-400">
                Tente ajustar os filtros ou termos de pesquisa
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                  <p className="text-sm font-medium">{selectedUser.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Papel</label>
                  <div className="mt-1">
                    <Badge className={getRoleBadgeColor(selectedUser.papel)}>
                      {selectedUser.papel_formatado}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CPF</label>
                  <p className="text-sm">{selectedUser.cpf_formatado || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-sm">{selectedUser.telefone_formatado || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                  <p className="text-sm">
                    {selectedUser.data_nascimento 
                      ? new Date(selectedUser.data_nascimento).toLocaleDateString('pt-BR')
                      : 'Não informado'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                  <p className="text-sm">{selectedUser.criado_em_formatado}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}