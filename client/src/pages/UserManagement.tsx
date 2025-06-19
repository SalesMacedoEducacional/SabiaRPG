import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, School, Users, GraduationCap, UserCircle, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  papel: 'admin' | 'manager' | 'teacher' | 'student';
  ativo: boolean;
  criado_em: string;
  escolas_vinculadas?: { id: string; nome: string }[];
}

interface Escola {
  id: string;
  nome: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");
  const [filtroPapel, setFiltroPapel] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  // Estados dos contadores
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [usuariosAtivos, setUsuariosAtivos] = useState(0);
  const [professores, setProfessores] = useState(0);
  const [alunos, setAlunos] = useState(0);
  const [gestores, setGestores] = useState(0);
  const [usuariosInativos, setUsuariosInativos] = useState(0);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/usuarios");
      const data = await response.json();
      
      if (data.usuarios) {
        setUsuarios(data.usuarios);
        calculateCounters(data.usuarios);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEscolas = async () => {
    try {
      const response = await apiRequest("GET", "/api/escolas/todas");
      const data = await response.json();
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    }
  };

  const calculateCounters = (usuarios: Usuario[]) => {
    setTotalUsuarios(usuarios.length);
    setUsuariosAtivos(usuarios.filter(u => u.ativo).length);
    setProfessores(usuarios.filter(u => u.papel === 'teacher').length);
    setAlunos(usuarios.filter(u => u.papel === 'student').length);
    setGestores(usuarios.filter(u => u.papel === 'manager').length);
    setUsuariosInativos(usuarios.filter(u => !u.ativo).length);
  };

  const handleEditUser = async (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!usuarioEditando) return;

    try {
      const response = await apiRequest("PUT", `/api/usuarios/${usuarioEditando.id}`, {
        nome: usuarioEditando.nome,
        email: usuarioEditando.email,
        telefone: usuarioEditando.telefone,
        cpf: usuarioEditando.cpf,
        ativo: usuarioEditando.ativo
      });

      if (response.ok) {
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram salvas com sucesso",
        });
        setIsEditDialogOpen(false);
        setUsuarioEditando(null);
        fetchUsuarios(); // Recarregar lista
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await apiRequest("DELETE", `/api/usuarios/${userId}`);
      
      if (response.ok) {
        toast({
          title: "Usuário excluído",
          description: `O usuário "${userName}" foi removido do sistema`,
        });
        fetchUsuarios(); // Recarregar lista automaticamente
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => {
      const matchEscola = filtroEscola === "todas" || 
        usuario.escolas_vinculadas?.some(escola => escola.id === filtroEscola);
      const matchPapel = filtroPapel === "todos" || usuario.papel === filtroPapel;
      const matchBusca = busca === "" || 
        usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.cpf.includes(busca);
      
      return matchEscola && matchPapel && matchBusca;
    });
  };

  const getPapelBadge = (papel: string) => {
    const badges = {
      admin: { label: "Admin", variant: "destructive" as const },
      manager: { label: "Gestor", variant: "secondary" as const },
      teacher: { label: "Professor", variant: "default" as const },
      student: { label: "Aluno", variant: "outline" as const }
    };
    return badges[papel as keyof typeof badges] || { label: papel, variant: "outline" as const };
  };

  useEffect(() => {
    fetchUsuarios();
    fetchEscolas();
  }, []);

  const usuariosFiltrados = filtrarUsuarios();

  return (
    <div className="min-h-screen bg-[#312e26] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              <Users className="inline h-6 w-6 mr-2" />
              USUÁRIOS
            </h1>
            <p className="text-accent">Gerencie todos os usuários do sistema</p>
          </div>
          <Button 
            className="bg-[#D47C06] hover:bg-[#B8650A] text-white"
            onClick={() => window.location.href = '/cadastrar-usuario'}
          >
            Novo Usuário
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalUsuarios}</div>
              <div className="text-sm text-accent">Total de Usuários</div>
            </CardContent>
          </Card>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{usuariosAtivos}</div>
              <div className="text-sm text-accent">Usuários Ativos</div>
            </CardContent>
          </Card>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{professores}</div>
              <div className="text-sm text-accent">Professores</div>
            </CardContent>
          </Card>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{alunos}</div>
              <div className="text-sm text-accent">Alunos</div>
            </CardContent>
          </Card>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{gestores}</div>
              <div className="text-sm text-accent">Gestores</div>
            </CardContent>
          </Card>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{usuariosInativos}</div>
              <div className="text-sm text-accent">Usuários Inativos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-[#4a4639] border-[#D47C06]">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-accent" />
                  <Input
                    placeholder="Buscar por nome, email ou CPF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 bg-[#312e26] border-[#D47C06] text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Filtrar por Escola</Label>
                <Select value={filtroEscola} onValueChange={setFiltroEscola}>
                  <SelectTrigger className="bg-[#312e26] border-[#D47C06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#4a4639] border-[#D47C06] text-white">
                    <SelectItem value="todas">Todas as escolas</SelectItem>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Filtrar por Papel</Label>
                <Select value={filtroPapel} onValueChange={setFiltroPapel}>
                  <SelectTrigger className="bg-[#312e26] border-[#D47C06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#4a4639] border-[#D47C06] text-white">
                    <SelectItem value="todos">Todos os papéis</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Gestor</SelectItem>
                    <SelectItem value="teacher">Professor</SelectItem>
                    <SelectItem value="student">Aluno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card className="bg-[#4a4639] border-[#D47C06]">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Lista de Usuários ({usuariosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-accent">Carregando usuários...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-accent">Nenhum usuário encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D47C06]">
                      <th className="text-left py-3 px-4 text-white">Nome</th>
                      <th className="text-left py-3 px-4 text-white">Email</th>
                      <th className="text-left py-3 px-4 text-white">CPF</th>
                      <th className="text-left py-3 px-4 text-white">Telefone</th>
                      <th className="text-left py-3 px-4 text-white">Papel</th>
                      <th className="text-left py-3 px-4 text-white">Escola</th>
                      <th className="text-left py-3 px-4 text-white">Status</th>
                      <th className="text-left py-3 px-4 text-white">Criado em</th>
                      <th className="text-center py-3 px-4 text-white">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-[#5a5438] hover:bg-[#43341c]">
                        <td className="py-3 px-4 text-white font-medium">{usuario.nome}</td>
                        <td className="py-3 px-4 text-accent">{usuario.email}</td>
                        <td className="py-3 px-4 text-accent">{usuario.cpf || 'Não informado'}</td>
                        <td className="py-3 px-4 text-accent">{usuario.telefone || 'Não informado'}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-primary">Editar Usuário</DialogTitle>
          </DialogHeader>
          {usuarioEditando && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={usuarioEditando.nome}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, nome: e.target.value})}
                  className="bg-[#4a4639] border-[#D47C06] text-white"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={usuarioEditando.email}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, email: e.target.value})}
                  className="bg-[#4a4639] border-[#D47C06] text-white"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={usuarioEditando.telefone || ""}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, telefone: e.target.value})}
                  className="bg-[#4a4639] border-[#D47C06] text-white"
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  value={usuarioEditando.cpf}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, cpf: e.target.value})}
                  className="bg-[#4a4639] border-[#D47C06] text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={usuarioEditando.ativo}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, ativo: e.target.checked})}
                  className="rounded border-[#D47C06]"
                />
                <Label htmlFor="ativo">Usuário ativo</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveUser} className="bg-[#D47C06] hover:bg-[#B8650A]">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}