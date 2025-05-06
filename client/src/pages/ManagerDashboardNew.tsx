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
import {
  Search, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  UserPlus, 
  BookOpen, 
  Award, 
  School, 
  FileText, 
  BarChart3, 
  FilePlus2, 
  Calendar, 
  Settings, 
  Bell, 
  Laptop, 
  Link, 
  User, 
  LogOut, 
  FileCog, 
  BookCopy, 
  Building, 
  UserCog, 
  Lock, 
  Trash2, 
  Upload, 
  Save,
  Plus,
  Edit,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';

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
  city?: string;
  state?: string;
  level?: string;
  teachers: number;
  students: number;
  active: boolean;
}

/**
 * Interface para os dados básicos de um usuário
 */
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin?: string;
}

/**
 * Dashboard para o perfil Gestor Escolar
 */
export default function ManagerDashboard() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState({
    schools: false,
    reports: false,
    users: false
  });
  const [firstTimeAccess, setFirstTimeAccess] = useState(false);
  
  // Buscar os dados iniciais
  useEffect(() => {
    fetchSchools();
    fetchReports();
    fetchUsers();
  }, []);
  
  // Verificar se é o primeiro acesso (sem escolas cadastradas)
  useEffect(() => {
    // Verificar se há um ID de escola no sessionStorage (adicionado durante cadastro)
    const savedSchoolId = sessionStorage.getItem('saved_school_id');
    
    // Se tiver uma escola salva na sessão, não redirecionar
    if (savedSchoolId) {
      console.log('Escola encontrada na sessão:', savedSchoolId);
      setFirstTimeAccess(false);
      
      // Adicionar a escola aos dados locais se não estiver lá
      if (schools.length === 0) {
        const schoolName = sessionStorage.getItem('saved_school_name') || 'Escola Cadastrada';
        setSchools([{
          id: savedSchoolId,
          name: schoolName,
          code: sessionStorage.getItem('saved_school_code') || '',
          city: sessionStorage.getItem('saved_school_city') || '',
          state: sessionStorage.getItem('saved_school_state') || '',
          level: 'Fundamental e Médio',
          students: 0,
          teachers: 0,
          active: true
        }]);
      }
      
      return; // Não prosseguir com o redirecionamento
    }
    
    // Somente redirecionar se não tiver escolas e não estiver carregando
    if (!loading.schools && schools.length === 0) {
      setFirstTimeAccess(true);
      
      // Exibir notificação sobre necessidade de cadastrar uma escola
      toast({
        title: "Bem-vindo ao SABIÁ RPG!",
        description: "É necessário cadastrar uma escola antes de utilizar a plataforma.",
      });
      
      // Redirecionar para a página de cadastro de escola
      setTimeout(() => {
        setLocation("/school-registration");
      }, 2000);
    }
  }, [schools, loading.schools, setLocation, toast]);
  
  // Funções para buscar dados
  const fetchSchools = async () => {
    setLoading(prev => ({ ...prev, schools: true }));
    try {
      // Consultar as escolas usando a API
      const response = await apiRequest('GET', '/api/schools');
      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log('Escolas encontradas na API:', data);
        setSchools(data);
      } else {
        console.log('Nenhuma escola encontrada na API, verificando escola na sessão');
        
        // Se não encontrar escolas, verificar se há escola salva na sessão
        const savedSchoolId = sessionStorage.getItem('saved_school_id');
        if (savedSchoolId) {
          console.log('Escola encontrada na sessão:', savedSchoolId);
          
          // Tentar obter mais detalhes da escola
          try {
            const schoolResponse = await apiRequest('GET', `/api/schools/${savedSchoolId}`);
            if (schoolResponse.ok) {
              const schoolData = await schoolResponse.json();
              setSchools([schoolData]);
              return;
            }
          } catch (detailError) {
            console.error('Erro ao buscar detalhes da escola da sessão:', detailError);
          }
          
          // Se não conseguir buscar detalhes, usar dados da sessão
          const schoolName = sessionStorage.getItem('saved_school_name') || 'Escola Cadastrada';
          setSchools([{
            id: savedSchoolId,
            name: schoolName,
            code: sessionStorage.getItem('saved_school_code') || '',
            city: sessionStorage.getItem('saved_school_city') || '',
            state: sessionStorage.getItem('saved_school_state') || '',
            level: 'Fundamental e Médio',
            students: 0,
            teachers: 0,
            active: true
          }]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar escolas:', error);
      
      // Verificar se há uma escola no sessionStorage como último recurso
      const savedSchoolId = sessionStorage.getItem('saved_school_id');
      if (savedSchoolId) {
        const schoolName = sessionStorage.getItem('saved_school_name') || 'Escola Cadastrada';
        setSchools([{
          id: savedSchoolId,
          name: schoolName,
          code: sessionStorage.getItem('saved_school_code') || '',
          city: sessionStorage.getItem('saved_school_city') || '',
          state: sessionStorage.getItem('saved_school_state') || '',
          level: 'Fundamental e Médio',
          students: 0,
          teachers: 0,
          active: true
        }]);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de escolas.',
          variant: 'destructive'
        });
      }
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
  
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      // Simular dados para teste
      setUsers([
        { id: '1', name: 'João Silva', email: 'joao.silva@escola.edu.br', role: 'professor', active: true, lastLogin: '2023-05-02' },
        { id: '2', name: 'Maria Souza', email: 'maria.souza@escola.edu.br', role: 'professor', active: true, lastLogin: '2023-05-01' },
        { id: '3', name: 'Pedro Santos', email: 'pedro.santos@escola.edu.br', role: 'aluno', active: true, lastLogin: '2023-05-03' },
        { id: '4', name: 'Ana Oliveira', email: 'ana.oliveira@escola.edu.br', role: 'aluno', active: false, lastLogin: '2023-04-15' }
      ]);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Funções para as ações
  const handleGenerateReport = () => {
    toast({
      title: 'Recurso em Desenvolvimento',
      description: 'A função de gerar novos relatórios está em desenvolvimento.',
    });
  };
  
  const handleAddUser = () => {
    setLocation("/user-registration");
  };
  
  const handleAddSchool = () => {
    setLocation("/school-registration");
  };
  
  const handleSaveProfile = () => {
    toast({
      title: 'Perfil Salvo',
      description: 'Suas informações de perfil foram atualizadas com sucesso.',
    });
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Gestor</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.fullName || 'Gestor'}!</p>
        </div>
        <Button variant="destructive" onClick={logout}>Sair</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
        </TabsList>
        
        {/* Aba 1: Visão Geral */}
        <TabsContent value="overview">
          {/* Primeira fileira - estatísticas gerais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Card 1 - Escolas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Escolas Vinculadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schools.length}</div>
                <p className="text-xs text-muted-foreground">
                  {schools.filter(s => s.active).length} ativas
                </p>
              </CardContent>
            </Card>
            
            {/* Card 2 - Professores */}
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
            
            {/* Card 3 - Alunos */}
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
            
            {/* Card 4 - Turmas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Distribuídas em todas as escolas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Segunda fileira - Ações rápidas e estatísticas */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
            {/* Coluna 1 - Ações rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso direto às principais tarefas administrativas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setLocation('/user-registration')}
                  >
                    <UserPlus className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-center">Cadastrar Novo Usuário</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setLocation('/school-registration')}
                  >
                    <Building className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-center">Cadastrar Nova Escola</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setLocation('/class-list')}
                  >
                    <BookCopy className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-center">Gerenciar Turmas</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setLocation('/manager/reports')}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-center">Gerar Relatórios</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Coluna 2-3 - Estatísticas e métricas */}
            <div className="col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Card 1 - Alunos Ativos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Alunos Ativos na Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">487</div>
                      <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">1.248</div>
                      <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card 2 - Engajamento */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Nível de Engajamento Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72%</div>
                  <div className="mt-2">
                    <Progress value={72} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Baseado no tempo de uso e missões completadas
                  </p>
                </CardContent>
              </Card>
              
              {/* Card 3 - Alertas */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Alerta de Evasão Potencial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold text-destructive">38</div>
                    <AlertTriangle className="h-5 w-5 text-destructive ml-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alunos com mais de 10 dias sem acesso
                  </p>
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    Ver Lista
                  </Button>
                </CardContent>
              </Card>
              
              {/* Card 4 - Missões */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Missões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">149</span>
                      <span className="text-xs text-muted-foreground">Em andamento</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">263</span>
                      <span className="text-xs text-muted-foreground">Concluídas</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">92</span>
                      <span className="text-xs text-muted-foreground">Pendentes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Terceira fileira - Escolas e Atividades */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Card 1 - Escolas com Maior Engajamento */}
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
            
            {/* Card 2 - Atividade Recente */}
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
        
        {/* Aba 2: Relatórios */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gerador de Relatórios</CardTitle>
                      <CardDescription>
                        Gere relatórios personalizados para análise de desempenho
                      </CardDescription>
                    </div>
                    <Button onClick={handleGenerateReport}>
                      <FilePlus2 className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo de Relatório</Label>
                        <Select defaultValue="turma">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="turma">Por Turma</SelectItem>
                            <SelectItem value="serie">Por Série</SelectItem>
                            <SelectItem value="disciplina">Por Disciplina</SelectItem>
                            <SelectItem value="aluno">Individual por Aluno</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Turma</Label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a turma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as Turmas</SelectItem>
                            <SelectItem value="6A">6º Ano A</SelectItem>
                            <SelectItem value="6B">6º Ano B</SelectItem>
                            <SelectItem value="7A">7º Ano A</SelectItem>
                            <SelectItem value="7B">7º Ano B</SelectItem>
                            <SelectItem value="8A">8º Ano A</SelectItem>
                            <SelectItem value="9A">9º Ano A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Escola</Label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a escola" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as Escolas</SelectItem>
                            {schools.map(school => (
                              <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Período</Label>
                        <Select defaultValue="bimestral">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="bimestral">Bimestral</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Formato de Exportação</Label>
                        <RadioGroup defaultValue="pdf" className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pdf" id="pdf" />
                            <Label htmlFor="pdf" className="font-normal">.pdf</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="xlsx" id="xlsx" />
                            <Label htmlFor="xlsx" className="font-normal">.xlsx</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ods" id="ods" />
                            <Label htmlFor="ods" className="font-normal">.ods</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="font-normal">.csv</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Métricas a incluir</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="metrica-1" defaultChecked />
                            <label htmlFor="metrica-1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Desempenho</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="metrica-2" defaultChecked />
                            <label htmlFor="metrica-2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Engajamento</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="metrica-3" defaultChecked />
                            <label htmlFor="metrica-3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Missões</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="metrica-4" defaultChecked />
                            <label htmlFor="metrica-4" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Trilhas</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Visualizar Prévia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Recentes</CardTitle>
                <CardDescription>
                  Relatórios gerados nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading.reports ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p>Carregando relatórios...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="p-4 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>Nenhum relatório encontrado</p>
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div 
                        key={report.id} 
                        className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium truncate">{report.title}</h4>
                            <p className="text-xs text-muted-foreground">{report.date}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{report.type}</Badge>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <Button variant="outline" className="w-full" onClick={fetchReports}>
                    {loading.reports ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Lista completa de relatórios para download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell className="capitalize">{report.type}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>PDF</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Detalhes">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba 3: Configurações */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gerenciamento de Escolas</CardTitle>
                      <CardDescription>
                        Cadastre e gerencie escolas na plataforma
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddSchool}>
                      <Building className="h-4 w-4 mr-2" />
                      Nova Escola
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar escolas..." className="pl-8" />
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Alunos</TableHead>
                          <TableHead>Professores</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schools.map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">{school.name}</TableCell>
                            <TableCell>{school.code}</TableCell>
                            <TableCell>{school.students}</TableCell>
                            <TableCell>{school.teachers}</TableCell>
                            <TableCell>
                              {school.active ? 
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativa</Badge> : 
                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Inativa</Badge>
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Detalhes">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {schools.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                              Nenhuma escola cadastrada. Clique em "Nova Escola" para adicionar.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gerenciamento de Usuários</CardTitle>
                      <CardDescription>
                        Cadastre e gerencie usuários da plataforma
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddUser}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Usuário
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar usuários..." className="pl-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="student">Alunos</SelectItem>
                          <SelectItem value="teacher">Professores</SelectItem>
                          <SelectItem value="manager">Gestores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell>
                              <Badge variant={user.active ? "default" : "outline"}>
                                {user.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Cronograma de Triagens e Missões</CardTitle>
                  <CardDescription>
                    Configure datas e períodos para atividades do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Período de Triagem Diagnóstica</Label>
                        <Select defaultValue="inicio-semestre">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inicio-semestre">Início do Semestre</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="bimestral">Bimestral</SelectItem>
                            <SelectItem value="personalizado">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Duração da Triagem (dias)</Label>
                        <Input type="number" min="1" max="30" defaultValue="7" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Notificação para Estudantes</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="notify-students" defaultChecked />
                          <label htmlFor="notify-students" className="font-normal">Enviar notificações automáticas</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Liberação de Missões</Label>
                        <Select defaultValue="semanal">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diaria">Diária</SelectItem>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="personalizado">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Dia da Semana para Novas Missões</Label>
                        <Select defaultValue="2">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Segunda-feira</SelectItem>
                            <SelectItem value="2">Terça-feira</SelectItem>
                            <SelectItem value="3">Quarta-feira</SelectItem>
                            <SelectItem value="4">Quinta-feira</SelectItem>
                            <SelectItem value="5">Sexta-feira</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Prazo para Conclusão (dias)</Label>
                        <Input type="number" min="1" max="60" defaultValue="14" />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="mt-6">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temas Prioritários</CardTitle>
                  <CardDescription>
                    Selecione áreas de conhecimento prioritárias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tema-1" defaultChecked />
                      <label htmlFor="tema-1" className="font-medium">Matemática</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tema-2" defaultChecked />
                      <label htmlFor="tema-2" className="font-medium">Português</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tema-3" />
                      <label htmlFor="tema-3" className="font-medium">Ciências</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tema-4" />
                      <label htmlFor="tema-4" className="font-medium">História</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tema-5" />
                      <label htmlFor="tema-5" className="font-medium">Geografia</label>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Adicionar Tema
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Permissões de Perfis</CardTitle>
                  <CardDescription>
                    Configure permissões básicas dos perfis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Professores podem:</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-1" defaultChecked />
                          <label htmlFor="perm-1" className="text-sm">Criar missões personalizadas</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-2" defaultChecked />
                          <label htmlFor="perm-2" className="text-sm">Gerenciar alunos</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-3" defaultChecked />
                          <label htmlFor="perm-3" className="text-sm">Ver relatórios de turma</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Alunos podem:</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-4" defaultChecked />
                          <label htmlFor="perm-4" className="text-sm">Participar do fórum</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-5" defaultChecked />
                          <label htmlFor="perm-5" className="text-sm">Ver ranking geral</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="perm-6" defaultChecked />
                          <label htmlFor="perm-6" className="text-sm">Personalizar avatar</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    Salvar Permissões
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>
                    Configure integrações com outros sistemas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Google Classroom</p>
                          <p className="text-xs text-muted-foreground">Sincronizar turmas e tarefas</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Conectar</Button>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <Link className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">SIGE</p>
                          <p className="text-xs text-muted-foreground">Sistema de Gestão Escolar</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Conectar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba 4: Meu Perfil */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e de contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" defaultValue={user?.fullName || "Carlos Oliveira"} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" defaultValue={user?.email || "carlos.oliveira@escola.edu.br"} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" defaultValue="(86) 99876-5432" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Cargo</Label>
                        <Input id="role" defaultValue="Diretor" disabled />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <textarea 
                        id="bio" 
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Diretor na Escola Municipal Pedro II há 8 anos. Especialista em Gestão Educacional."
                      ></textarea>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Gerencie sua senha e configurações de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input id="current-password" type="password" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notificações de Segurança</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="login-notify" defaultChecked />
                        <label htmlFor="login-notify" className="text-sm">Receber notificações de novos logins</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Lock className="h-4 w-4 mr-2" />
                    Atualizar Senha
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Foto de Perfil</CardTitle>
                  <CardDescription>
                    Altere sua foto ou escolha um avatar
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/assets/avatar-placeholder.png" alt="Avatar" />
                      <AvatarFallback>CO</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 rounded-full p-1 bg-background border border-input">
                      <Edit className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 w-full mb-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i}
                        className="cursor-pointer p-1 border rounded-md hover:bg-muted flex items-center justify-center"
                      >
                        <div className="rounded-full h-10 w-10 bg-primary/10"></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-full">
                    <div className="relative">
                      <Input type="file" id="avatar-upload" className="sr-only" />
                      <Label 
                        htmlFor="avatar-upload"
                        className="cursor-pointer flex items-center justify-center gap-2 border rounded-md p-2 w-full hover:bg-muted"
                      >
                        <Upload className="h-4 w-4" />
                        Enviar Foto
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Registros de Acesso</CardTitle>
                  <CardDescription>
                    Histórico de acesso à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Login bem-sucedido</p>
                          <p className="text-xs text-muted-foreground">Hoje, 08:15</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Teresina, PI</Badge>
                      </div>
                    </div>
                    
                    <div className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Login bem-sucedido</p>
                          <p className="text-xs text-muted-foreground">Ontem, 15:48</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Teresina, PI</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Login bem-sucedido</p>
                          <p className="text-xs text-muted-foreground">25/04/2023, 09:22</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Teresina, PI</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Permissões</CardTitle>
                  <CardDescription>
                    Suas permissões na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="w-full justify-start text-sm py-2 px-3">
                      Gerenciar Escolas
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3">
                      Gerenciar Usuários
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3">
                      Configurar Sistema
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3">
                      Gerar Relatórios
                    </Badge>
                    <Badge className="w-full justify-start text-sm py-2 px-3">
                      Administrar Conteúdos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}