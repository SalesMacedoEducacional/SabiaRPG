import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Download, RefreshCw, Info, Users, BookOpen, Award, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';

/**
 * Interface para os dados básicos de um relatório
 */
interface ReportData {
  id: string;
  title: string;
  type: 'school' | 'class' | 'region';
  date: string;
  downloadUrl?: string;
}

/**
 * Interface para os dados básicos de uma escola
 */
interface SchoolData {
  id: string;
  name: string;
  code: string;
  teachers: number;
  students: number;
  active: boolean;
}

/**
 * Interface para os dados básicos de uma integração
 */
interface IntegrationData {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

/**
 * Dashboard principal para o perfil Gestor
 */
export default function ManagerDashboard() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState({
    schools: false,
    reports: false,
    integrations: false
  });
  
  // Buscar os dados iniciais
  useEffect(() => {
    fetchSchools();
    fetchReports();
    fetchIntegrations();
  }, []);
  
  // Funções para buscar dados
  const fetchSchools = async () => {
    setLoading(prev => ({ ...prev, schools: true }));
    try {
      const response = await apiRequest('GET', '/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Erro ao buscar escolas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de escolas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, schools: false }));
    }
  };
  
  const fetchReports = async () => {
    setLoading(prev => ({ ...prev, reports: true }));
    try {
      const response = await apiRequest('GET', '/api/reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os relatórios.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };
  
  const fetchIntegrations = async () => {
    setLoading(prev => ({ ...prev, integrations: true }));
    try {
      const response = await apiRequest('GET', '/api/integrations');
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as integrações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, integrations: false }));
    }
  };

  // Funções para as ações
  const handleNewSchool = () => {
    toast({
      title: 'Recursos em Desenvolvimento',
      description: 'A função de adicionar escolas está em desenvolvimento.',
    });
  };
  
  const handleGenerateReport = () => {
    toast({
      title: 'Recursos em Desenvolvimento',
      description: 'A função de gerar novos relatórios está em desenvolvimento.',
    });
  };
  
  const handleIntegration = () => {
    toast({
      title: 'Recursos em Desenvolvimento',
      description: 'A função de configurar integrações está em desenvolvimento.',
    });
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Gestor</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.fullName || 'Gestor'}!</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={() => setActiveTab('settings')}>
            Configurações
          </Button>
          <Button variant="destructive" onClick={logout}>Sair</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="schools">Escolas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Escolas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schools.length}</div>
                <p className="text-xs text-muted-foreground">
                  {schools.filter(s => s.active).length} ativas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {schools.reduce((sum, school) => sum + school.teachers, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Em todas as escolas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {schools.reduce((sum, school) => sum + school.students, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Em todas as escolas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Disponíveis para download
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Escolas Recentes</CardTitle>
                <CardDescription>
                  Lista das últimas escolas adicionadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schools.slice(0, 3).map(school => (
                    <div key={school.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-sm text-muted-foreground">Código: {school.code}</p>
                      </div>
                      <Badge variant={school.active ? "default" : "outline"}>
                        {school.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setActiveTab('schools')}>
                    Ver todas as escolas
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Recentes</CardTitle>
                <CardDescription>
                  Últimos relatórios gerados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.slice(0, 3).map(report => (
                    <div key={report.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">Data: {report.date}</p>
                      </div>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setActiveTab('reports')}>
                    Ver todos os relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Escolas */}
        <TabsContent value="schools">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gerenciamento de Escolas</CardTitle>
                  <CardDescription>
                    Gerencie todas as escolas da rede
                  </CardDescription>
                </div>
                <Button onClick={handleNewSchool}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Escola
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar escolas..." className="pl-8" />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="inactive">Inativas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchSchools} disabled={loading.schools}>
                    <RefreshCw className={`h-4 w-4 ${loading.schools ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md">
                <div className="grid grid-cols-12 bg-muted p-4 rounded-t-md font-medium">
                  <div className="col-span-5">Nome</div>
                  <div className="col-span-2">Código</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Professores</div>
                  <div className="col-span-2">Alunos</div>
                </div>
                
                {loading.schools ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Carregando escolas...</p>
                  </div>
                ) : schools.length === 0 ? (
                  <div className="p-8 text-center">
                    <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>Nenhuma escola encontrada</p>
                    <Button variant="outline" className="mt-4" onClick={handleNewSchool}>
                      Adicionar Escola
                    </Button>
                  </div>
                ) : (
                  schools.map((school, index) => (
                    <div 
                      key={school.id} 
                      className={`grid grid-cols-12 p-4 hover:bg-muted/50 cursor-pointer ${
                        index !== schools.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="col-span-5 font-medium">{school.name}</div>
                      <div className="col-span-2 text-muted-foreground">{school.code}</div>
                      <div className="col-span-1">
                        <Badge variant={school.active ? "default" : "outline"}>
                          {school.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {school.teachers}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {school.students}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Relatórios</CardTitle>
                  <CardDescription>
                    Gere e visualize relatórios detalhados
                  </CardDescription>
                </div>
                <Button onClick={handleGenerateReport}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar relatórios..." className="pl-8" />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="school">Escola</SelectItem>
                      <SelectItem value="class">Turma</SelectItem>
                      <SelectItem value="region">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchReports} disabled={loading.reports}>
                    <RefreshCw className={`h-4 w-4 ${loading.reports ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md">
                <div className="grid grid-cols-5 bg-muted p-4 rounded-t-md font-medium">
                  <div className="col-span-2">Título</div>
                  <div className="col-span-1">Tipo</div>
                  <div className="col-span-1">Data</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>
                
                {loading.reports ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Carregando relatórios...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="p-8 text-center">
                    <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>Nenhum relatório encontrado</p>
                    <Button variant="outline" className="mt-4" onClick={handleGenerateReport}>
                      Gerar Relatório
                    </Button>
                  </div>
                ) : (
                  reports.map((report, index) => (
                    <div 
                      key={report.id} 
                      className={`grid grid-cols-5 p-4 hover:bg-muted/50 ${
                        index !== reports.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="col-span-2 font-medium">{report.title}</div>
                      <div className="col-span-1">
                        <Badge variant="outline">
                          {report.type === 'school' ? 'Escola' : 
                            report.type === 'class' ? 'Turma' : 'Regional'}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-muted-foreground">{report.date}</div>
                      <div className="col-span-1 flex justify-end gap-2">
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integrações */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>
                    Gerencie as integrações com sistemas externos
                  </CardDescription>
                </div>
                <Button onClick={handleIntegration}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Integração
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="icon" onClick={fetchIntegrations} disabled={loading.integrations}>
                  <RefreshCw className={`h-4 w-4 ${loading.integrations ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <div className="border rounded-md">
                <div className="grid grid-cols-5 bg-muted p-4 rounded-t-md font-medium">
                  <div className="col-span-2">Nome</div>
                  <div className="col-span-1">Tipo</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>
                
                {loading.integrations ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Carregando integrações...</p>
                  </div>
                ) : integrations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>Nenhuma integração encontrada</p>
                    <Button variant="outline" className="mt-4" onClick={handleIntegration}>
                      Configurar Integração
                    </Button>
                  </div>
                ) : (
                  integrations.map((integration, index) => (
                    <div 
                      key={integration.id} 
                      className={`grid grid-cols-5 p-4 hover:bg-muted/50 ${
                        index !== integrations.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="col-span-2 font-medium">{integration.name}</div>
                      <div className="col-span-1 text-muted-foreground">{integration.type}</div>
                      <div className="col-span-1">
                        <Badge 
                          variant={
                            integration.status === 'active' ? 'default' : 
                            integration.status === 'inactive' ? 'outline' : 'destructive'
                          }
                        >
                          {integration.status === 'active' ? 'Ativa' : 
                           integration.status === 'inactive' ? 'Inativa' : 'Erro'}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex justify-end gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          disabled={integration.status !== 'active'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Gerencie as configurações do SABIÁ RPG para sua rede
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Configurações de Perfil</h3>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Nome Completo</label>
                      </div>
                      <div className="col-span-3">
                        <Input defaultValue={user?.fullName || ''} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Email</label>
                      </div>
                      <div className="col-span-3">
                        <Input defaultValue={user?.email || ''} />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Salvar Alterações</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Configurações de Segurança</h3>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Senha Atual</label>
                      </div>
                      <div className="col-span-3">
                        <Input type="password" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Nova Senha</label>
                      </div>
                      <div className="col-span-3">
                        <Input type="password" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Confirmar Senha</label>
                      </div>
                      <div className="col-span-3">
                        <Input type="password" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Alterar Senha</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Configurações do Sistema</h3>
                  <Separator className="my-4" />
                  <p className="text-muted-foreground mb-4">
                    Estas configurações afetam todas as escolas e usuários da sua rede.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Nome da Rede</label>
                      </div>
                      <div className="col-span-3">
                        <Input defaultValue="Rede Municipal de Educação" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium">Ano Letivo</label>
                      </div>
                      <div className="col-span-3">
                        <Select defaultValue="2023">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o ano letivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Salvar Configurações</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}