import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Plus, Edit, Download, RefreshCw, AlertTriangle, Users, UserPlus, BookOpen, Award, School, FileText, BarChart3, FilePlus2, Calendar, Settings, Bell, Laptop, Link, User, LogOut, FileCog, BookCopy, Building, UserCog, Lock, Trash2, Upload, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';

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
    // Redirecionar para a página de cadastro de escolas
    window.location.href = '/school-registration';
  };
  
  const handleGenerateReport = () => {
    setActiveTab('reports');
    toast({
      title: 'Geração de Relatórios',
      description: 'Acesse a aba de relatórios para gerar novos relatórios.',
    });
  };
  
  const handleIntegration = () => {
    setActiveTab('settings');
    toast({
      title: 'Configuração de Integrações',
      description: 'Acesse a aba de configurações para gerenciar integrações.',
    });
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">DASHBOARD DO GESTOR</h1>
          <p className="text-gray-300">Bem-vindo, gestor!</p>
        </div>
        <div>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={logout}>Sair</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 gap-1 bg-[#231f20] mb-4">
          <TabsTrigger 
            value="overview" 
            className="bg-[#3e2a18] text-gray-200 hover:text-white data-[state=active]:bg-[#a85f16] data-[state=active]:text-white py-2">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="bg-[#3e2a18] text-gray-200 hover:text-white data-[state=active]:bg-[#a85f16] data-[state=active]:text-white py-2">
            Relatórios
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="bg-[#3e2a18] text-gray-200 hover:text-white data-[state=active]:bg-[#a85f16] data-[state=active]:text-white py-2">
            Configurações
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="bg-[#3e2a18] text-gray-200 hover:text-white data-[state=active]:bg-[#a85f16] data-[state=active]:text-white py-2">
            Meu Perfil
          </TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none text-white">
              <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-white">
                  Total de Escolas Vinculadas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-0">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <p className="text-xs text-gray-300">0 ativas</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none text-white">
              <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-white">
                  Total de Professores
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-0">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <p className="text-xs text-gray-300">Em todas as escolas</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none text-white">
              <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-white">
                  Total de Alunos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-0">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <p className="text-xs text-gray-300">Em todas as escolas</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#3e2a18] border-none rounded-sm shadow-none text-white">
              <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-white">
                  Turmas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-0">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <p className="text-xs text-gray-300">Distribuídas em todas as escolas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-amber-900/20 border-amber-900/50 text-amber-50 col-span-1 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Alunos Ativos na Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">487</div>
                    <p className="text-xs text-amber-200/70">Últimos 7 dias</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1.248</div>
                    <p className="text-xs text-amber-200/70">Últimos 30 dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-900/20 border-amber-900/50 text-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Nível de Engajamento Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
                <div className="mt-2">
                  <Progress value={72} className="h-2 bg-amber-900/40" />
                </div>
                <p className="text-xs text-amber-200/70 mt-2">
                  Baseado no tempo de uso e missões completadas
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-900/20 border-amber-900/50 text-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Alerta de Evasão Potencial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-red-400">38 </div>
                  <AlertTriangle className="h-5 w-5 text-red-400 ml-2" />
                </div>
                <p className="text-xs text-amber-200/70">
                  Alunos com mais de 10 dias sem acesso
                </p>
                <Button className="w-full mt-2 text-xs bg-amber-800 hover:bg-amber-700 text-amber-50" size="sm">
                  Ver Lista
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-6">
            <Card className="bg-amber-900/20 border-amber-900/50 text-amber-50 col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold">149</span>
                    <span className="text-xs text-amber-200/70">Em andamento</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold">263</span>
                    <span className="text-xs text-amber-200/70">Concluídas</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold">92</span>
                    <span className="text-xs text-amber-200/70">Pendentes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Escolas com Maior Engajamento</CardTitle>
                <CardDescription>
                  Escolas com maiores taxas de participação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schools.slice(0, 3).map((school, index) => (
                    <div key={school.id} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 font-bold">
                            {index + 1}
                          </div>
                          <p className="font-medium">{school.name}</p>
                        </div>
                        <Badge variant="outline">{Math.floor(70 + Math.random() * 20)}%</Badge>
                      </div>
                      <Progress value={Math.floor(70 + Math.random() * 20)} className="h-2" />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{school.teachers} professores</span>
                        <span>{school.students} alunos</span>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('reports')}>
                    Ver relatório detalhado
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas ações e eventos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Novo relatório gerado</p>
                      <p className="text-sm text-muted-foreground">Relatório bimestral da Escola Municipal Pedro II</p>
                      <p className="text-xs text-muted-foreground mt-1">Hoje, 09:45</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start pb-4 border-b">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Novos usuários cadastrados</p>
                      <p className="text-sm text-muted-foreground">12 alunos adicionados à plataforma</p>
                      <p className="text-xs text-muted-foreground mt-1">Ontem, 15:20</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-amber-500/10 p-2 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Alerta de engajamento</p>
                      <p className="text-sm text-muted-foreground">Queda de atividade em 2 turmas do 8º ano</p>
                      <p className="text-xs text-muted-foreground mt-1">2 dias atrás</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Ver todas as atividades
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