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
import { useUpdateUsuario, useDeleteUsuario } from '@/hooks/useEnhancedMutations';
import { CardLoadingOverlay } from '@/components/ui/loading-spinner';
import { useGlobalDataSync } from '@/hooks/useGlobalDataSync';

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

  // Enhanced mutations with auto-refresh
  const updateUsuarioMutation = useUpdateUsuario();
  const deleteUsuarioMutation = useDeleteUsuario();
  const { isRefreshing } = useGlobalDataSync();

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
      const response = await apiRequest("GET", "/api/usuarios");
      console.log("Resposta da API usuários:", response);
      
      if (response && typeof response === 'object') {
        const usuariosData = (response as any).usuarios || [];
        console.log(`${usuariosData.length} usuários encontrados`);
        setUsuarios(usuariosData);
      } else {
        console.warn("Resposta inesperada da API");
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
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

  const fetchEscolas = async () => {
    try {
      console.log("Carregando escolas...");
      const data = await apiRequest("GET", "/api/escolas/gestor");
      console.log("Escolas recebidas:", data);
      
      // Garantir que sempre temos um array
      if (Array.isArray(data)) {
        setEscolas(data);
      } else {
        console.warn("Dados de escolas não são um array:", data);
        setEscolas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      setEscolas([]);
    }
  };

  const fetchContadores = async () => {
    try {
      console.log("Calculando contadores a partir dos usuários carregados...");
      
      if (usuarios.length > 0) {
        const total = usuarios.length;
        const ativos = usuarios.filter(u => u.ativo).length;
        const professoresCount = usuarios.filter(u => ['teacher', 'professor'].includes(u.papel)).length;
        const alunosCount = usuarios.filter(u => ['student', 'aluno'].includes(u.papel)).length;
        const gestoresCount = usuarios.filter(u => ['manager', 'gestor'].includes(u.papel)).length;
        const inativos = usuarios.filter(u => !u.ativo).length;
        
        console.log("Contadores calculados:", { total, ativos, professoresCount, alunosCount, gestoresCount, inativos });
        
        setTotalUsuarios(total);
        setUsuariosAtivos(ativos);
        setProfessores(professoresCount);
        setAlunos(alunosCount);
        setGestores(gestoresCount);
        setUsuariosInativos(inativos);
      } else {
        console.log("Nenhum usuário carregado para calcular contadores");
        setTotalUsuarios(0);
        setUsuariosAtivos(0);
        setProfessores(0);
        setAlunos(0);
        setGestores(0);
        setUsuariosInativos(0);
      }
    } catch (error) {
      console.error("Erro ao calcular contadores:", error);
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

    deleteUsuarioMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: "Usuário excluído",
          description: `O usuário "${userName}" foi removido do sistema. Dados atualizados automaticamente.`,
        });
        fetchUsuarios(); // Backup refresh
      },
      onError: (error) => {
        console.error("Erro ao excluir usuário:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o usuário",
          variant: "destructive",
        });
      }
    });
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
      admin: { label: "Admin", className: "bg-red-600 text-white border-red-700 px-3 py-1 rounded-full text-xs font-semibold" },
      manager: { label: "Gestor", className: "bg-[#D47C06] text-white border-[#B8650A] px-3 py-1 rounded-full text-xs font-semibold" },
      gestor: { label: "Gestor", className: "bg-[#D47C06] text-white border-[#B8650A] px-3 py-1 rounded-full text-xs font-semibold" },
      teacher: { label: "Professor", className: "bg-blue-600 text-white border-blue-700 px-3 py-1 rounded-full text-xs font-semibold" },
      professor: { label: "Professor", className: "bg-blue-600 text-white border-blue-700 px-3 py-1 rounded-full text-xs font-semibold" },
      student: { label: "Aluno", className: "bg-green-600 text-white border-green-700 px-3 py-1 rounded-full text-xs font-semibold" },
      aluno: { label: "Aluno", className: "bg-green-600 text-white border-green-700 px-3 py-1 rounded-full text-xs font-semibold" }
    };
    return badges[papel as keyof typeof badges] || { label: papel, className: "bg-gray-600 text-white border-gray-700 px-3 py-1 rounded-full text-xs font-semibold" };
  };

  const getStatusBadge = (ativo: boolean) => {
    return ativo 
      ? { label: "Ativo", className: "bg-green-600 text-white border-green-700 px-3 py-1 rounded-full text-xs font-semibold" }
      : { label: "Inativo", className: "bg-red-600 text-white border-red-700 px-3 py-1 rounded-full text-xs font-semibold" };
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUsuarios();
      await fetchEscolas();
      // fetchContadores será executado após usuários carregarem
    };
    loadData();
  }, []);

  useEffect(() => {
    // Recalcular contadores sempre que usuários mudarem
    fetchContadores();
  }, [usuarios]);

  const usuariosFiltrados = filtrarUsuarios();

  // Debug logs detalhados
  console.log("=== ESTADO ATUAL ===");
  console.log("Total usuarios carregados:", usuarios.length);
  console.log("Usuarios após filtros:", usuariosFiltrados.length);
  console.log("Estado de carregamento:", isLoading);
  console.log("Array completo de usuarios:", usuarios);
  console.log("Filtros aplicados - Escola:", filtroEscola, "Papel:", filtroPapel, "Busca:", busca);

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
          onClick={() => {
            console.log('Navegando para cadastro de usuário...');
            window.location.href = '/user-registration';
          }}
        >
          Novo Usuário
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <CardLoadingOverlay isLoading={isRefreshing || deleteUsuarioMutation.isPending}>
          <Card className="bg-[#4a4639] border-[#D47C06]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalUsuarios}</div>
              <div className="text-sm text-accent">Total de Usuários</div>
            </CardContent>
          </Card>
        </CardLoadingOverlay>
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
                  <SelectItem value="geral">Geral</SelectItem>
                  {Array.isArray(escolas) && escolas.map((escola) => (
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-white">
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-[#5a5438] hover:bg-[#43341c]">
                      <td className="py-3 px-4 text-white font-medium">{usuario.nome}</td>
                      <td className="py-3 px-4 text-accent">{usuario.email}</td>
                      <td className="py-3 px-4 text-accent">{usuario.cpf}</td>
                      <td className="py-3 px-4">
                        <span className={getPapelBadge(usuario.papel).className}>
                          {getPapelBadge(usuario.papel).label}
                        </span>
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
                        <span className={getStatusBadge(usuario.ativo).className}>
                          {getStatusBadge(usuario.ativo).label}
                        </span>
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
                    <span className={getPapelBadge(usuarioDetalhes.papel).className}>
                      {getPapelBadge(usuarioDetalhes.papel).label}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">Status</Label>
                  <div className="bg-[#4a4639] p-3 rounded border border-[#D47C06]">
                    <span className={getStatusBadge(usuarioDetalhes.ativo).className}>
                      {getStatusBadge(usuarioDetalhes.ativo).label}
                    </span>
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