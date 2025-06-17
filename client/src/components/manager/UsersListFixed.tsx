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
  escola_id?: string;
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
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      console.log("CARREGANDO USUARIOS - INICIO");
      
      const response = await apiRequest("GET", "/api/usuarios");
      console.log("RESPOSTA RAW:", response);
      
      // Extrair dados do Response object
      const responseData = await response.json();
      console.log("DADOS EXTRAIDOS DO JSON:", responseData);
      
      let usuariosData = [];
      
      if (responseData && Array.isArray(responseData)) {
        usuariosData = responseData;
      } else if (responseData && responseData.usuarios && Array.isArray(responseData.usuarios)) {
        usuariosData = responseData.usuarios;
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        usuariosData = responseData.data;
      } else {
        console.error("FORMATO NAO RECONHECIDO:", responseData);
        usuariosData = [];
      }
      
      console.log("USUARIOS FINAIS:", usuariosData);
      console.log("QUANTIDADE FINAL:", usuariosData.length);
      
      setUsuarios(usuariosData);
      
    } catch (error) {
      console.error("ERRO TOTAL:", error);
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
      const response = await apiRequest("GET", "/api/escolas/gestor");
      const data = await response.json();
      
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

    // Filtro por busca inteligente
    if (busca) {
      const termoBusca = busca.toLowerCase().trim();
      usuariosFiltrados = usuariosFiltrados.filter(usuario => {
        // Detectar padrão de busca
        const isEmail = termoBusca.includes('@');
        const isCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(termoBusca) || /^\d{11}$/.test(termoBusca);
        const isTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(termoBusca) || /^\d{10,11}$/.test(termoBusca);
        
        if (isEmail) {
          return usuario.email?.toLowerCase().includes(termoBusca);
        } else if (isCPF) {
          return usuario.cpf?.replace(/[^\d]/g, '').includes(termoBusca.replace(/[^\d]/g, ''));
        } else if (isTelefone) {
          return usuario.telefone?.replace(/[^\d]/g, '').includes(termoBusca.replace(/[^\d]/g, ''));
        } else {
          // Busca por nome ou qualquer campo
          return usuario.nome?.toLowerCase().includes(termoBusca) ||
                 usuario.email?.toLowerCase().includes(termoBusca) ||
                 usuario.cpf?.includes(termoBusca) ||
                 usuario.telefone?.includes(termoBusca);
        }
      });
    }

    // Filtro por papel
    if (filtroPapel !== "todos") {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => {
        if (filtroPapel === "gestor") return ['manager', 'gestor', 'admin'].includes(usuario.papel);
        if (filtroPapel === "professor") return ['teacher', 'professor'].includes(usuario.papel);
        if (filtroPapel === "aluno") return ['student', 'aluno'].includes(usuario.papel);
        return usuario.papel === filtroPapel;
      });
    }

    // Filtro por escola
    if (filtroEscola !== "todas") {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => {
        // Verificar se o usuario tem escola_id que corresponde ao filtro
        return usuario.escola_id === filtroEscola ||
               usuario.escolas_vinculadas?.some(escola => escola.id === filtroEscola);
      });
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

  const handleViewUser = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (usuario: Usuario) => {
    setEditingUser({ ...usuario });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    const confirmSave = confirm("Tem certeza que deseja salvar as alterações feitas neste usuário?");
    if (!confirmSave) return;

    try {
      await apiRequest("PUT", `/api/usuarios/${editingUser.id}`, {
        nome: editingUser.nome,
        email: editingUser.email,
        telefone: editingUser.telefone,
        cpf: editingUser.cpf,
        ativo: editingUser.ativo
      });

      toast({
        title: "Usuário atualizado",
        description: `${editingUser.nome} foi atualizado com sucesso`,
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      carregarUsuarios(); // Atualizar lista instantaneamente
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    }
  };

  // Debug logs críticos
  console.log("=== ESTADO CRÍTICO DO COMPONENTE ===");
  console.log("- Array usuarios:", usuarios);
  console.log("- Tamanho usuarios:", usuarios.length);
  console.log("- Array usuariosFiltrados:", usuariosFiltrados);
  console.log("- Tamanho usuariosFiltrados:", usuariosFiltrados.length);
  console.log("- IsLoading:", isLoading);
  console.log("- Contadores calculados:", { totalUsuarios, usuariosAtivos, professores, alunos, gestores });
  console.log("- Busca atual:", busca);
  console.log("- Filtro escola:", filtroEscola);
  console.log("- Filtro papel:", filtroPapel);
  console.log("=====================================");

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
              <label className="text-sm font-medium text-accent">Filtrar por Escola</label>
              <Select value={filtroEscola} onValueChange={setFiltroEscola}>
                <SelectTrigger className="bg-[#3c3830] border-[#5a5438] text-white">
                  <SelectValue placeholder="Todas as escolas" />
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
              <label className="text-sm font-medium text-accent">Filtrar por Papel</label>
              <Select value={filtroPapel} onValueChange={setFiltroPapel}>
                <SelectTrigger className="bg-[#3c3830] border-[#5a5438] text-white">
                  <SelectValue placeholder="Todos os papéis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os papéis</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="aluno">Aluno</SelectItem>
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
                    <th className="text-left py-3 px-4 text-accent font-medium">E-mail</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">CPF</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Telefone</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Papel</th>
                    <th className="text-left py-3 px-4 text-accent font-medium">Escola de Vínculo</th>
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
                        <td className="py-3 px-4 text-accent">{usuario.telefone || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getPapelBadge(usuario.papel).variant}>
                            {getPapelBadge(usuario.papel).label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {usuario.escola_nome && usuario.escola_nome !== 'Geral' ? (
                            <Badge variant="outline" className="text-xs">
                              <School className="h-3 w-3 mr-1" />
                              {usuario.escola_nome}
                            </Badge>
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
                              onClick={() => handleViewUser(usuario)}
                              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(usuario)}
                              className="border-[#D47C06] text-[#D47C06] hover:bg-[#D47C06] hover:text-white"
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(usuario.id, usuario.nome)}
                              title="Excluir usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-accent">
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

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[#312e26] border-[#5a5438] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-accent text-sm font-medium">Nome Completo:</label>
                  <p className="text-white text-lg">{selectedUser.nome}</p>
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">E-mail:</label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">CPF:</label>
                  <p className="text-white">{selectedUser.cpf}</p>
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">Telefone:</label>
                  <p className="text-white">{selectedUser.telefone || 'Não informado'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-accent text-sm font-medium">Papel no Sistema:</label>
                  <div className="mt-1">
                    <Badge variant={getPapelBadge(selectedUser.papel).variant}>
                      {getPapelBadge(selectedUser.papel).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">Status:</label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.ativo ? "default" : "secondary"}>
                      {selectedUser.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">Escolas Vinculadas:</label>
                  {selectedUser.escolas_vinculadas?.length ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser.escolas_vinculadas.map((escola) => (
                        <Badge key={escola.id} variant="outline" className="text-xs">
                          <School className="h-3 w-3 mr-1" />
                          {escola.nome}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white">Geral</p>
                  )}
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">Criado em:</label>
                  <p className="text-white">{new Date(selectedUser.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#312e26] border-[#5a5438] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-accent text-sm font-medium">Nome Completo:</label>
                  <Input
                    value={editingUser.nome}
                    onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})}
                    className="bg-[#3c3830] border-[#5a5438] text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">E-mail:</label>
                  <Input
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="bg-[#3c3830] border-[#5a5438] text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">CPF:</label>
                  <Input
                    value={editingUser.cpf}
                    onChange={(e) => setEditingUser({...editingUser, cpf: e.target.value})}
                    className="bg-[#3c3830] border-[#5a5438] text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-accent text-sm font-medium">Telefone:</label>
                  <Input
                    value={editingUser.telefone || ''}
                    onChange={(e) => setEditingUser({...editingUser, telefone: e.target.value})}
                    className="bg-[#3c3830] border-[#5a5438] text-white mt-1"
                    placeholder="Digite o telefone"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-accent text-sm font-medium">Status do Usuário:</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={editingUser.ativo}
                      onChange={() => setEditingUser({...editingUser, ativo: true})}
                      className="text-accent"
                    />
                    <span className="text-white">Ativo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!editingUser.ativo}
                      onChange={() => setEditingUser({...editingUser, ativo: false})}
                      className="text-accent"
                    />
                    <span className="text-white">Inativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-[#5a5438] text-white hover:bg-[#5a5438]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveUser}
                  className="bg-[#D47C06] hover:bg-[#B8650A] text-white"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}