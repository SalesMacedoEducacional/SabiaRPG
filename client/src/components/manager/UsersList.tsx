import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

export default function UsersList() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEscola, setFiltroEscola] = useState<string>("todas");
  const [filtroPapel, setFiltroPapel] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [usuarioDetalhes, setUsuarioDetalhes] = useState<any>(null);

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
      console.log("Carregando usuários...");
      const data = await apiRequest("GET", "/api/usuarios");
      
      if (data.usuarios) {
        console.log("Usuários carregados:", data.usuarios.length);
        setUsuarios(data.usuarios);
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
      console.log("Carregando escolas...");
      const data = await apiRequest("GET", "/api/escolas/gestor");
      console.log("Escolas carregadas:", data.length);
      setEscolas(data || []);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
    }
  };

  const fetchContadores = async () => {
    try {
      console.log("Carregando contadores...");
      const data = await apiRequest("GET", "/api/usuarios/contadores");
      
      console.log("Contadores recebidos:", data);
      setTotalUsuarios(data.total || 0);
      setUsuariosAtivos(data.ativos || 0);
      setProfessores(data.professores || 0);
      setAlunos(data.alunos || 0);
      setGestores(data.gestores || 0);
      setUsuariosInativos(data.inativos || 0);
    } catch (error) {
      console.error("Erro ao buscar contadores:", error);
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

  const handleViewUserDetails = async (usuarioId: string) => {
    try {
      console.log("Carregando detalhes do usuário:", usuarioId);
      const data = await apiRequest("GET", `/api/usuarios/${usuarioId}`);
      console.log("Detalhes recebidos:", data);
      setUsuarioDetalhes(data);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes do usuário",
        variant: "destructive",
      });
    }
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
        fetchUsuarios();
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
        fetchUsuarios();
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
    if (!usuarios || usuarios.length === 0) return [];
    
    return usuarios.filter(usuario => {
      // Filtro por escola
      const matchEscola = filtroEscola === "todas" || 
        (usuario.escola_nome && usuario.escola_nome !== 'Geral' && 
         usuario.escolas_vinculadas?.some(escola => escola.id === filtroEscola)) ||
        (usuario.escola_nome === 'Geral' && filtroEscola === "geral");
      
      // Filtro por papel - mapear papéis corretamente
      const papelMap: { [key: string]: string[] } = {
        'todos': ['admin', 'manager', 'teacher', 'student', 'gestor', 'professor', 'aluno'],
        'gestor': ['manager', 'gestor'],
        'professor': ['teacher', 'professor'],
        'aluno': ['student', 'aluno'],
        'admin': ['admin']
      };
      const matchPapel = filtroPapel === "todos" || 
        papelMap[filtroPapel]?.includes(usuario.papel) || 
        usuario.papel === filtroPapel;
      
      // Filtro por busca
      const matchBusca = busca === "" || 
        usuario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.cpf?.includes(busca);
      
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
    fetchContadores();
  }, []);

  const usuariosFiltrados = filtrarUsuarios();

  return (
    <div className="space-y-6">
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
          onClick={() => window.location.href = '/user-registration'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label className="text-white">Todas as escolas</Label>
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
              <Label className="text-white">Todos os papéis</Label>
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
          <CardTitle className="text-white">Lista de Usuários ({usuariosFiltrados.length})</CardTitle>
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
                            onClick={() => handleViewUserDetails(usuario.id)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-[#312e26] border-[#D47C06] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {usuarioDetalhes && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-accent">Nome Completo</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    {usuarioDetalhes.nome}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">Email</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    {usuarioDetalhes.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">CPF</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    {usuarioDetalhes.cpf || 'Não informado'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">Telefone</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    {usuarioDetalhes.telefone || 'Não informado'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">Papel</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    <Badge variant={getPapelBadge(usuarioDetalhes.papel).variant}>
                      {getPapelBadge(usuarioDetalhes.papel).label}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">Status</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    <Badge variant={usuarioDetalhes.ativo ? "default" : "secondary"}>
                      {usuarioDetalhes.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Escolas Vinculadas */}
              {usuarioDetalhes.escolas_vinculadas && usuarioDetalhes.escolas_vinculadas.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-accent">Escolas Vinculadas</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    <div className="flex flex-wrap gap-2">
                      {usuarioDetalhes.escolas_vinculadas.map((escola: any) => (
                        <Badge key={escola.id} variant="outline" className="text-accent">
                          <School className="h-3 w-3 mr-1" />
                          {escola.nome}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Detalhes Específicos do Perfil */}
              {usuarioDetalhes.detalhes_perfil && Object.keys(usuarioDetalhes.detalhes_perfil).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-accent">Informações do Perfil</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(usuarioDetalhes.detalhes_perfil).map(([key, value]) => {
                        if (key === 'id' || key === 'usuario_id' || key === 'escola_id' || key === 'escolas_vinculadas') return null;
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-accent capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-white">{String(value) || 'N/A'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Data de Criação */}
              <div className="space-y-2">
                <Label className="text-accent">Criado em</Label>
                <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                  {new Date(usuarioDetalhes.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="border-[#D47C06] text-[#D47C06] hover:bg-[#D47C06] hover:text-white"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}