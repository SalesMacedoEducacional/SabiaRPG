import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Users, Search, School, GraduationCap, UserCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  papel: 'admin' | 'manager' | 'teacher' | 'student' | 'gestor' | 'professor' | 'aluno';
  ativo: boolean;
  criado_em: string;
  escola_nome?: string;
  escolas_vinculadas?: { id: string; nome: string }[];
}

interface Escola {
  id: string;
  nome: string;
}

export default function UsersListFixed() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");
  const [filtroPapel, setFiltroPapel] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Estados dos contadores - calcular em tempo real
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(u => u.ativo).length;
  const professores = usuarios.filter(u => ['teacher', 'professor'].includes(u.papel)).length;
  const alunos = usuarios.filter(u => ['student', 'aluno'].includes(u.papel)).length;
  const gestores = usuarios.filter(u => ['manager', 'gestor', 'admin'].includes(u.papel)).length;
  const usuariosInativos = usuarios.filter(u => !u.ativo).length;

  const carregarUsuarios = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Carregando usuários...");
      
      const response = await apiRequest("GET", "/api/usuarios");
      console.log("📋 Resposta completa da API:", response);
      
      if (response && (response as any).usuarios) {
        const usuariosData = (response as any).usuarios;
        console.log(`✅ ${usuariosData.length} usuários carregados:`, usuariosData);
        setUsuarios(usuariosData);
      } else {
        console.error("❌ Formato de resposta inválido:", response);
        setUsuarios([]);
      }
    } catch (error) {
      console.error("💥 Erro ao carregar usuários:", error);
      setUsuarios([]);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const carregarEscolas = async () => {
    try {
      const data = await apiRequest("GET", "/api/escolas/gestor");
      if (Array.isArray(data)) {
        setEscolas(data);
      } else {
        setEscolas([]);
      }
    } catch (error) {
      console.error("Erro ao carregar escolas:", error);
      setEscolas([]);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarEscolas();
  }, []);

  const filtrarUsuarios = () => {
    let usuariosFiltrados = [...usuarios];

    // Filtro por busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      usuariosFiltrados = usuariosFiltrados.filter(usuario =>
        usuario.nome.toLowerCase().includes(termoBusca) ||
        usuario.email.toLowerCase().includes(termoBusca) ||
        usuario.cpf.includes(termoBusca)
      );
    }

    // Filtro por papel
    if (filtroPapel !== "todos") {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => {
        if (filtroPapel === "gestores") return ['manager', 'gestor', 'admin'].includes(usuario.papel);
        if (filtroPapel === "professores") return ['teacher', 'professor'].includes(usuario.papel);
        if (filtroPapel === "alunos") return ['student', 'aluno'].includes(usuario.papel);
        return usuario.papel === filtroPapel;
      });
    }

    // Filtro por escola
    if (filtroEscola !== "todas") {
      usuariosFiltrados = usuariosFiltrados.filter(usuario =>
        usuario.escolas_vinculadas?.some(escola => escola.id === filtroEscola)
      );
    }

    return usuariosFiltrados;
  };

  const usuariosFiltrados = filtrarUsuarios();

  const getPapelBadge = (papel: string) => {
    switch (papel) {
      case 'admin':
      case 'manager':
      case 'gestor':
        return { label: 'Gestor', variant: 'default' as const };
      case 'teacher':
      case 'professor':
        return { label: 'Professor', variant: 'secondary' as const };
      case 'student':
      case 'aluno':
        return { label: 'Aluno', variant: 'outline' as const };
      default:
        return { label: papel, variant: 'outline' as const };
    }
  };

  const handleDeleteUser = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) return;

    try {
      await apiRequest("DELETE", `/api/usuarios/${id}`);
      toast({
        title: "Usuário excluído",
        description: `${nome} foi removido do sistema`,
      });
      carregarUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (usuario: Usuario) => {
    // Implementar edição
    console.log("Editar usuário:", usuario);
  };

  // Debug logs
  console.log("🔍 ESTADO ATUAL:");
  console.log("- Usuários carregados:", usuarios.length);
  console.log("- Usuários filtrados:", usuariosFiltrados.length);
  console.log("- Carregando:", isLoading);
  console.log("- Contadores:", { totalUsuarios, usuariosAtivos, professores, alunos, gestores });

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-[#312e26] border-[#5a5438]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white">{totalUsuarios}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#312e26] border-[#5a5438]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-400">{usuariosAtivos}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#312e26] border-[#5a5438]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Professores
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-400">{professores}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#312e26] border-[#5a5438]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
              <Users className="h-4 w-4" />
              Alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-yellow-400">{alunos}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#312e26] border-[#5a5438]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
              <School className="h-4 w-4" />
              Gestores
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-400">{gestores}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#312e26] border-[#5a5438]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Usuários Inativos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-400">{usuariosInativos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-[#312e26] border-[#5a5438]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-[#3c3830] border-[#5a5438] text-white placeholder:text-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Todas as escolas</label>
              <Select value={filtroEscola} onValueChange={setFiltroEscola}>
                <SelectTrigger className="bg-[#3c3830] border-[#5a5438] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as escolas</SelectItem>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-accent">Todos os papéis</label>
              <Select value={filtroPapel} onValueChange={setFiltroPapel}>
                <SelectTrigger className="bg-[#3c3830] border-[#5a5438] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os papéis</SelectItem>
                  <SelectItem value="gestores">Gestores</SelectItem>
                  <SelectItem value="professores">Professores</SelectItem>
                  <SelectItem value="alunos">Alunos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card className="bg-[#312e26] border-[#5a5438]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Lista de Usuários ({usuariosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-white">
              Carregando usuários...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#5a5438]">
                    <th className="text-left py-3 px-4 text-accent font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">CPF</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Papel</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Escolas</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Criado em</th>
                    <th className="text-center py-3 px-4 text-accent font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-[#5a5438] hover:bg-[#43341c]">
                        <td className="py-3 px-4 text-white font-medium">{usuario.nome}</td>
                        <td className="py-3 px-4 text-accent">{usuario.email}</td>
                        <td className="py-3 px-4 text-accent">{usuario.cpf}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getPapelBadge(usuario.papel).variant}>
                            {getPapelBadge(usuario.papel).label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {usuario.escolas_vinculadas?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {usuario.escolas_vinculadas.map((escola) => (
                                <Badge key={escola.id} variant="outline" className="text-xs">
                                  <School className="h-3 w-3 mr-1" />
                                  {escola.nome}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-accent">Geral</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={usuario.ativo ? "default" : "secondary"}>
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-accent">
                          {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(usuario)}
                              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(usuario)}
                              className="border-[#D47C06] text-[#D47C06] hover:bg-[#D47C06] hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(usuario.id, usuario.nome)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-accent">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-[#312e26] border-[#5a5438] text-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-accent text-sm">Nome:</label>
                <p className="text-white">{selectedUser.nome}</p>
              </div>
              <div>
                <label className="text-accent text-sm">Email:</label>
                <p className="text-white">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-accent text-sm">CPF:</label>
                <p className="text-white">{selectedUser.cpf}</p>
              </div>
              <div>
                <label className="text-accent text-sm">Papel:</label>
                <p className="text-white">{getPapelBadge(selectedUser.papel).label}</p>
              </div>
              <div>
                <label className="text-accent text-sm">Status:</label>
                <p className="text-white">{selectedUser.ativo ? "Ativo" : "Inativo"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}