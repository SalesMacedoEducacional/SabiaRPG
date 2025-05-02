import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  FileSpreadsheet, 
  UsersRound, 
  School, 
  Settings, 
  Calendar, 
  UserPlus, 
  Cable, 
  ScrollText, 
  Download, 
  Send, 
  BarChart4 
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';

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

const ManagerDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('relatorios');
  
  // Estado para os dados de exemplo (simulação)
  const [reports] = useState<ReportData[]>([
    { 
      id: 'r1', 
      title: 'Desempenho Escolar 2023', 
      type: 'school', 
      date: '20/04/2023',
      downloadUrl: '#' 
    },
    { 
      id: 'r2', 
      title: 'Progresso Regional', 
      type: 'region', 
      date: '15/03/2023',
      downloadUrl: '#'  
    },
    { 
      id: 'r3', 
      title: 'Estatísticas de Uso', 
      type: 'school', 
      date: '10/05/2023',
      downloadUrl: '#'  
    },
  ]);
  
  const [schools] = useState<SchoolData[]>([
    {
      id: 's1',
      name: 'Escola Municipal Pedro II',
      code: 'EM-001',
      teachers: 35,
      students: 650,
      active: true
    },
    {
      id: 's2',
      name: 'Escola Estadual Dom Pedro I',
      code: 'EE-022',
      teachers: 42,
      students: 820,
      active: true
    },
    {
      id: 's3',
      name: 'Centro Educacional Maria José',
      code: 'CE-045',
      teachers: 28,
      students: 520,
      active: false
    }
  ]);
  
  const [integrations] = useState<IntegrationData[]>([
    {
      id: 'i1',
      name: 'SIGE Piauí',
      type: 'API',
      status: 'active',
      lastSync: '01/05/2023'
    },
    {
      id: 'i2',
      name: 'Google Classroom',
      type: 'OAuth',
      status: 'inactive'
    },
    {
      id: 'i3',
      name: 'Sistema Censo Escolar',
      type: 'SFTP',
      status: 'error',
      lastSync: '15/03/2023'
    }
  ]);
  
  // Função para demo de exportação
  const handleExportData = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'Os dados serão exportados e o download iniciará em breve.',
    });
  };
  
  // Função para demo de notificação
  const handleSendNotification = () => {
    toast({
      title: 'Notificação enviada',
      description: 'A notificação foi enviada para todos os destinatários selecionados.',
    });
  };
  
  // Verifica se o usuário tem permissão para exportar dados
  const canExportData = hasPermission(PERMISSIONS.REPORT_EXPORT.id);
  
  // Verifica se o usuário tem permissão para gerenciar escolas
  const canManageSchools = hasPermission(PERMISSIONS.SCHOOL_CONFIG.id);
  
  // Verifica se o usuário tem permissão para gerenciar integrações
  const canManageIntegrations = hasPermission(PERMISSIONS.INTEGRATION_MANAGE.id);
  
  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-parchment mb-2">Administração Escolar</h1>
          <p className="text-parchment-dark">
            Bem-vindo ao Painel de Administração, {user?.fullName}. 
            Gerencie todos os aspectos da plataforma SABIÁ-RPG para sua instituição.
          </p>
        </div>
        
        <Tabs defaultValue="relatorios" value={activeTab} onValueChange={setActiveTab} 
          className="space-y-4">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2">
            <TabsTrigger value="relatorios" className="flex flex-col items-center p-2">
              <FileSpreadsheet className="h-5 w-5 mb-1" />
              <span className="text-xs">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex flex-col items-center p-2">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="contas" className="flex flex-col items-center p-2">
              <UsersRound className="h-5 w-5 mb-1" />
              <span className="text-xs">Contas</span>
            </TabsTrigger>
            <TabsTrigger value="matriculas" className="flex flex-col items-center p-2">
              <UserPlus className="h-5 w-5 mb-1" />
              <span className="text-xs">Matrículas</span>
            </TabsTrigger>
            <TabsTrigger value="escolas" className="flex flex-col items-center p-2">
              <School className="h-5 w-5 mb-1" />
              <span className="text-xs">Escolas</span>
            </TabsTrigger>
            <TabsTrigger value="integrações" className="flex flex-col items-center p-2">
              <Cable className="h-5 w-5 mb-1" />
              <span className="text-xs">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex flex-col items-center p-2">
              <ScrollText className="h-5 w-5 mb-1" />
              <span className="text-xs">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="comunicados" className="flex flex-col items-center p-2">
              <Send className="h-5 w-5 mb-1" />
              <span className="text-xs">Comunicados</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab: Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle className="text-parchment">Relatórios Escolares</CardTitle>
                  <CardDescription>
                    Relatórios de desempenho por escola
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-[180px] flex items-center justify-center border rounded border-primary/20">
                    <BarChart4 className="h-20 w-20 text-primary/50" />
                  </div>
                  <Button className="w-full">Ver Relatórios Escolares</Button>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle className="text-parchment">Relatórios Regionais</CardTitle>
                  <CardDescription>
                    Comparativos e métricas por região
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-[180px] flex items-center justify-center border rounded border-primary/20">
                    <BarChart4 className="h-20 w-20 text-primary/50" />
                  </div>
                  <Button className="w-full">Ver Relatórios Regionais</Button>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle className="text-parchment">Relatórios Personalizados</CardTitle>
                  <CardDescription>
                    Crie relatórios com métricas específicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-[180px] flex items-center justify-center border rounded border-primary/20">
                    <FileSpreadsheet className="h-20 w-20 text-primary/50" />
                  </div>
                  <Button className="w-full">Criar Novo Relatório</Button>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-parchment">Relatórios Recentes</CardTitle>
                  {canExportData && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportData}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar Dados</span>
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Visualize e baixe os relatórios gerados recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div 
                      key={report.id} 
                      className="flex justify-between items-center p-3 border border-primary/20 rounded-md hover:bg-dark-lighter transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-parchment">{report.title}</p>
                        <p className="text-xs text-parchment-dark">
                          {report.type === 'school' ? 'Escola' : 
                           report.type === 'class' ? 'Turma' : 'Regional'} • {report.date}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle className="text-parchment">Configurações Escolares</CardTitle>
                <CardDescription>
                  Defina parâmetros gerais para toda a escola
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="school-name">Nome da Escola</Label>
                  <Input id="school-name" defaultValue="Escola Municipal João Paulo II" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-parchment">Sistema de XP</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="xp-missao">XP Base por Missão</Label>
                      <Input id="xp-missao" type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xp-bonus">Bônus de XP por Excelência</Label>
                      <Input id="xp-bonus" type="number" defaultValue="50" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nivel-max">Nível Máximo</Label>
                      <Input id="nivel-max" type="number" defaultValue="50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xp-por-nivel">XP para Subir de Nível</Label>
                      <Input id="xp-por-nivel" type="number" defaultValue="1000" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-parchment">Configurações de Triagem</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="triagem-obrigatoria">Triagem Obrigatória</Label>
                    <Switch id="triagem-obrigatoria" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="permitir-pular">Permitir Pular Triagem</Label>
                    <Switch id="permitir-pular" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="triagem-periodica">Triagem Periódica</Label>
                    <Switch id="triagem-periodica" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo-triagem">Intervalo de Triagem (dias)</Label>
                    <Input id="periodo-triagem" type="number" defaultValue="90" />
                  </div>
                </div>
                
                <Button className="w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Contas */}
          <TabsContent value="contas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle className="text-parchment">Gestão de Alunos</CardTitle>
                  <CardDescription>
                    Gerenciar contas de alunos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-parchment">534</p>
                    <p className="text-sm text-parchment-dark">Alunos ativos</p>
                  </div>
                  <Button className="w-full">Gerenciar Alunos</Button>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle className="text-parchment">Gestão de Professores</CardTitle>
                  <CardDescription>
                    Gerenciar contas de professores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-parchment">42</p>
                    <p className="text-sm text-parchment-dark">Professores ativos</p>
                  </div>
                  <Button className="w-full">Gerenciar Professores</Button>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle className="text-parchment">Gestão de Gestores</CardTitle>
                  <CardDescription>
                    Gerenciar contas de gestores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-parchment">8</p>
                    <p className="text-sm text-parchment-dark">Gestores ativos</p>
                  </div>
                  <Button className="w-full">Gerenciar Gestores</Button>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-parchment">Criar Nova Conta</CardTitle>
                </div>
                <CardDescription>
                  Adicione um novo usuário ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-user-name">Nome Completo</Label>
                      <Input id="new-user-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-user-email">Email</Label>
                      <Input id="new-user-email" type="email" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-user-role">Perfil</Label>
                      <select id="new-user-role" className="w-full rounded-md bg-dark border border-primary p-2">
                        <option value="student">Aluno</option>
                        <option value="teacher">Professor</option>
                        <option value="manager">Gestor</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-user-school">Escola</Label>
                      <select id="new-user-school" className="w-full rounded-md bg-dark border border-primary p-2">
                        {schools.map(school => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <Button className="w-full">Criar Conta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Escolas */}
          <TabsContent value="escolas" className="space-y-4">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-parchment">Escolas Cadastradas</CardTitle>
                  {canManageSchools && (
                    <Button variant="default" size="sm">
                      Adicionar Escola
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Gerencie as escolas participantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schools.map((school) => (
                    <div 
                      key={school.id} 
                      className="p-4 border border-primary/20 rounded-md hover:bg-dark-lighter transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-parchment">{school.name}</p>
                          <p className="text-sm text-parchment-dark">Código: {school.code}</p>
                          <div className="flex space-x-4 mt-2">
                            <p className="text-xs text-parchment-dark">
                              <span className="font-semibold">{school.teachers}</span> professores
                            </p>
                            <p className="text-xs text-parchment-dark">
                              <span className="font-semibold">{school.students}</span> alunos
                            </p>
                            <p className={`text-xs ${school.active ? 'text-green-500' : 'text-red-500'}`}>
                              {school.active ? 'Ativa' : 'Inativa'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Configurar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Integrações */}
          <TabsContent value="integrações" className="space-y-4">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-parchment">Integrações Externas</CardTitle>
                  {canManageIntegrations && (
                    <Button variant="default" size="sm">
                      Nova Integração
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Gerencie integrações com sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div 
                      key={integration.id} 
                      className="p-4 border border-primary/20 rounded-md hover:bg-dark-lighter transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-parchment">{integration.name}</p>
                          <p className="text-sm text-parchment-dark">Tipo: {integration.type}</p>
                          {integration.lastSync && (
                            <p className="text-xs text-parchment-dark mt-1">
                              Última sincronização: {integration.lastSync}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`h-2 w-2 rounded-full ${
                            integration.status === 'active' ? 'bg-green-500' : 
                            integration.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-parchment-dark">
                            {integration.status === 'active' ? 'Ativa' : 
                             integration.status === 'inactive' ? 'Inativa' : 'Erro'}
                          </span>
                          <div className="ml-4">
                            <Button variant="outline" size="sm">Configurar</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle className="text-parchment">Autenticação e Tokens</CardTitle>
                <CardDescription>
                  Gerenciar credenciais para integrações externas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sige-token">Token SIGE</Label>
                    <div className="flex space-x-2">
                      <Input id="sige-token" type="password" value="••••••••••••••••" readOnly />
                      <Button variant="outline" size="sm">Renovar</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="google-auth">Autorização Google</Label>
                    <div className="flex space-x-2">
                      <Input id="google-auth" placeholder="Não configurado" readOnly />
                      <Button variant="outline" size="sm">Configurar</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-parchment">Sincronização Automática</p>
                      <p className="text-xs text-parchment-dark">
                        Sincronizar dados automaticamente todos os dias
                      </p>
                    </div>
                    <Switch id="sync-auto" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Comunicados */}
          <TabsContent value="comunicados" className="space-y-4">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle className="text-parchment">Enviar Comunicado</CardTitle>
                <CardDescription>
                  Envie comunicados para alunos, professores ou toda a escola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title">Título</Label>
                    <Input id="announcement-title" placeholder="Digite o título do comunicado" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="announcement-content">Conteúdo</Label>
                    <textarea 
                      id="announcement-content" 
                      className="w-full h-32 bg-dark border border-primary rounded-md p-2"
                      placeholder="Digite o conteúdo do comunicado"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="announcement-recipients">Destinatários</Label>
                    <select 
                      id="announcement-recipients" 
                      className="w-full bg-dark border border-primary rounded-md p-2"
                    >
                      <option value="all">Todos</option>
                      <option value="students">Apenas Alunos</option>
                      <option value="teachers">Apenas Professores</option>
                      <option value="managers">Apenas Gestores</option>
                    </select>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleSendNotification}
                  >
                    Enviar Comunicado
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle className="text-parchment">Comunicados Anteriores</CardTitle>
                <CardDescription>
                  Histórico de comunicados enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-primary/20 rounded-md">
                    <p className="font-semibold text-parchment">Manutenção Programada</p>
                    <p className="text-xs text-parchment-dark">30/04/2023 • Todos os usuários</p>
                    <p className="text-sm mt-2 text-parchment-dark">
                      O sistema estará indisponível para manutenção programada no dia 02/05/2023 das 22h às 00h.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-primary/20 rounded-md">
                    <p className="font-semibold text-parchment">Nova Trilha de Matemática</p>
                    <p className="text-xs text-parchment-dark">25/04/2023 • Alunos e Professores</p>
                    <p className="text-sm mt-2 text-parchment-dark">
                      Uma nova trilha de aprendizado de Matemática foi disponibilizada para todos os alunos.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-primary/20 rounded-md">
                    <p className="font-semibold text-parchment">Calendário de Triagens</p>
                    <p className="text-xs text-parchment-dark">20/04/2023 • Professores</p>
                    <p className="text-sm mt-2 text-parchment-dark">
                      O novo calendário de triagens diagnósticas já está disponível na plataforma.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Mostrar Tab Padrão */}
          {!['relatorios', 'configuracoes', 'contas', 'escolas', 'integrações', 'comunicados'].includes(activeTab) && (
            <div className="flex items-center justify-center h-64">
              <p className="text-parchment-dark">Selecione uma aba para visualizar o conteúdo</p>
            </div>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default ManagerDashboard;