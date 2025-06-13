import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  User
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalEscolas: number;
  totalProfessores: number;
  totalAlunos: number;
  totalTurmas: number;
}

interface Escola {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  cidades?: { nome: string };
  estados?: { nome: string; sigla: string };
}

interface Turma {
  id: string;
  nome: string;
  ano_letivo: string;
  periodo: string;
  ativo: boolean;
  escolas: { nome: string };
}

interface Professor {
  id: string;
  usuarios: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone?: string;
    papel: string;
  };
  escolas: { nome: string };
}

interface Aluno {
  id: string;
  usuarios: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone?: string;
    papel: string;
  };
  turmas: {
    nome: string;
    escolas: { nome: string };
  };
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  papel: string;
  ativo: boolean;
  criado_em: string;
}

export default function AdminPanel() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  // Queries para buscar dados
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: escolasData, isLoading: escolasLoading } = useQuery<{total: number; escolas: Escola[]}>({
    queryKey: ['/api/escolas'],
  });

  const { data: turmasData, isLoading: turmasLoading } = useQuery<{total: number; turmas: Turma[]}>({
    queryKey: ['/api/turmas'],
  });

  const { data: professoresData, isLoading: professoresLoading } = useQuery<{total: number; professores: Professor[]}>({
    queryKey: ['/api/professores'],
  });

  const { data: alunosData, isLoading: alunosLoading } = useQuery<{total: number; alunos: Aluno[]}>({
    queryKey: ['/api/alunos'],
  });

  const { data: usuariosData, isLoading: usuariosLoading } = useQuery<{total: number; usuarios: Usuario[]}>({
    queryKey: ['/api/usuarios'],
  });

  const handleViewDetails = (item: any, type: string) => {
    setSelectedItem(item);
    setDialogType(`view-${type}`);
    setDialogOpen(true);
  };

  const handleEdit = (item: any, type: string) => {
    setSelectedItem(item);
    setDialogType(`edit-${type}`);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm(`Tem certeza que deseja excluir este ${type}?`)) {
      return;
    }

    try {
      await apiRequest(`/api/${type}s/${id}`, 'DELETE');
      toast({
        title: "Sucesso",
        description: `${type} excluído com sucesso!`
      });
      
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: [`/api/${type}s`] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao excluir ${type}`,
        variant: "destructive"
      });
    }
  };

  const renderActionButtons = (item: any, type: string) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleViewDetails(item, type)}
      >
        <Eye className="w-4 h-4 mr-1" />
        Ver detalhes
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleEdit(item, type)}
      >
        <Edit className="w-4 h-4 mr-1" />
        Editar
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDelete(item.id, type)}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Excluir
      </Button>
    </div>
  );

  const renderDetailsDialog = () => {
    if (!selectedItem || !dialogType.startsWith('view-')) return null;

    const type = dialogType.replace('view-', '');
    
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes - {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {type === 'escola' && (
            <>
              <div><strong>Nome:</strong> {selectedItem.nome}</div>
              <div><strong>Endereço:</strong> {selectedItem.endereco || 'Não informado'}</div>
              <div><strong>Telefone:</strong> {selectedItem.telefone || 'Não informado'}</div>
              <div><strong>Email:</strong> {selectedItem.email || 'Não informado'}</div>
              <div><strong>Cidade:</strong> {selectedItem.cidades?.nome || 'Não informado'}</div>
              <div><strong>Estado:</strong> {selectedItem.estados?.nome || 'Não informado'}</div>
              <div><strong>Status:</strong> 
                <Badge variant={selectedItem.ativo ? "default" : "destructive"} className="ml-2">
                  {selectedItem.ativo ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </>
          )}
          
          {type === 'turma' && (
            <>
              <div><strong>Nome:</strong> {selectedItem.nome}</div>
              <div><strong>Ano Letivo:</strong> {selectedItem.ano_letivo}</div>
              <div><strong>Período:</strong> {selectedItem.periodo}</div>
              <div><strong>Escola:</strong> {selectedItem.escolas?.nome}</div>
              <div><strong>Status:</strong> 
                <Badge variant={selectedItem.ativo ? "default" : "destructive"} className="ml-2">
                  {selectedItem.ativo ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </>
          )}
          
          {(type === 'professor' || type === 'aluno') && (
            <>
              <div><strong>Nome:</strong> {selectedItem.usuarios?.nome}</div>
              <div><strong>Email:</strong> {selectedItem.usuarios?.email}</div>
              <div><strong>CPF:</strong> {selectedItem.usuarios?.cpf}</div>
              <div><strong>Telefone:</strong> {selectedItem.usuarios?.telefone || 'Não informado'}</div>
              <div><strong>Papel:</strong> {selectedItem.usuarios?.papel}</div>
              {type === 'professor' && (
                <div><strong>Escola:</strong> {selectedItem.escolas?.nome}</div>
              )}
              {type === 'aluno' && (
                <>
                  <div><strong>Turma:</strong> {selectedItem.turmas?.nome}</div>
                  <div><strong>Escola:</strong> {selectedItem.turmas?.escolas?.nome}</div>
                </>
              )}
            </>
          )}
          
          {type === 'usuario' && (
            <>
              <div><strong>Nome:</strong> {selectedItem.nome}</div>
              <div><strong>Email:</strong> {selectedItem.email}</div>
              <div><strong>CPF:</strong> {selectedItem.cpf}</div>
              <div><strong>Telefone:</strong> {selectedItem.telefone || 'Não informado'}</div>
              <div><strong>Papel:</strong> {selectedItem.papel}</div>
              <div><strong>Status:</strong> 
                <Badge variant={selectedItem.ativo ? "default" : "destructive"} className="ml-2">
                  {selectedItem.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div><strong>Criado em:</strong> {new Date(selectedItem.criado_em).toLocaleDateString('pt-BR')}</div>
            </>
          )}
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escolas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalEscolas || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalProfessores || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalAlunos || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalTurmas || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Gerenciamento */}
      <Tabs defaultValue="escolas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="escolas">Escolas</TabsTrigger>
          <TabsTrigger value="turmas">Turmas</TabsTrigger>
          <TabsTrigger value="professores">Professores</TabsTrigger>
          <TabsTrigger value="alunos">Alunos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        {/* Tab Escolas */}
        <TabsContent value="escolas">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Escolas ({escolasData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {escolasLoading ? (
                  <div>Carregando escolas...</div>
                ) : (
                  <div className="space-y-4">
                    {escolasData?.escolas?.map((escola) => (
                      <div key={escola.id} className="border rounded p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{escola.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {escola.cidades?.nome}, {escola.estados?.sigla}
                          </p>
                          <Badge variant={escola.ativo ? "default" : "destructive"}>
                            {escola.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        {renderActionButtons(escola, 'escola')}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Turmas */}
        <TabsContent value="turmas">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Turmas ({turmasData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {turmasLoading ? (
                  <div>Carregando turmas...</div>
                ) : (
                  <div className="space-y-4">
                    {turmasData?.turmas?.map((turma) => (
                      <div key={turma.id} className="border rounded p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{turma.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {turma.ano_letivo} - {turma.periodo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Escola: {turma.escolas?.nome}
                          </p>
                          <Badge variant={turma.ativo ? "default" : "destructive"}>
                            {turma.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        {renderActionButtons(turma, 'turma')}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Professores */}
        <TabsContent value="professores">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Professores ({professoresData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {professoresLoading ? (
                  <div>Carregando professores...</div>
                ) : (
                  <div className="space-y-4">
                    {professoresData?.professores?.map((professor) => (
                      <div key={professor.id} className="border rounded p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{professor.usuarios?.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {professor.usuarios?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Escola: {professor.escolas?.nome}
                          </p>
                        </div>
                        {renderActionButtons(professor, 'professor')}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Alunos */}
        <TabsContent value="alunos">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Alunos ({alunosData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {alunosLoading ? (
                  <div>Carregando alunos...</div>
                ) : (
                  <div className="space-y-4">
                    {alunosData?.alunos?.map((aluno) => (
                      <div key={aluno.id} className="border rounded p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{aluno.usuarios?.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {aluno.usuarios?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Turma: {aluno.turmas?.nome} - {aluno.turmas?.escolas?.nome}
                          </p>
                        </div>
                        {renderActionButtons(aluno, 'aluno')}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Usuários */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários ({usuariosData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {usuariosLoading ? (
                  <div>Carregando usuários...</div>
                ) : (
                  <div className="space-y-4">
                    {usuariosData?.usuarios?.map((usuario) => (
                      <div key={usuario.id} className="border rounded p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{usuario.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {usuario.email} - {usuario.papel}
                          </p>
                          <Badge variant={usuario.ativo ? "default" : "destructive"}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(usuario, 'usuario')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(usuario, 'usuario')}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para exibir detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {renderDetailsDialog()}
      </Dialog>
    </div>
  );
}