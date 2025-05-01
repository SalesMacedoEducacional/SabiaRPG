import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar as AvatarComponent } from '@/components/Avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Medal,
  Search,
  Download,
  BarChart2,
  Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/context/AuthContext';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch users (students)
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users?role=student').then(res => res.json()),
  });
  
  // Fetch learning paths
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['/api/learning-paths'],
  });
  
  // Fetch user progress
  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/user-progress'],
  });
  
  // Filter students by search term
  const filteredStudents = searchTerm 
    ? students.filter(student => 
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : students;
  
  // Calculate area completion for students
  const calculateAreaCompletion = (studentId: number, area: string) => {
    const pathsInArea = learningPaths.filter(path => path.area === area);
    if (pathsInArea.length === 0) return 0;
    
    const missionIds = pathsInArea.flatMap(path => 
      // In a real scenario, we would fetch missions by path
      // For now, let's assume we have a mapping
      []
    );
    
    const completedMissions = userProgress.filter(
      progress => progress.userId === studentId && 
      missionIds.includes(progress.missionId) && 
      progress.completed
    );
    
    return missionIds.length > 0 
      ? Math.round((completedMissions.length / missionIds.length) * 100)
      : 0;
  };
  
  // Generate sample data for charts
  const areaCompletionData = [
    { name: 'Matemática', value: 65 },
    { name: 'Linguagens', value: 78 },
    { name: 'Ciências', value: 45 },
    { name: 'História', value: 52 },
    { name: 'Geografia', value: 60 },
    { name: 'Artes', value: 38 },
  ];
  
  const studentPerformanceData = [
    { name: 'Média de Acertos', matematica: 75, linguagens: 85, ciencias: 60, historia: 70 },
    { name: 'Tempo Médio (min)', matematica: 25, linguagens: 30, ciencias: 20, historia: 35 },
    { name: 'Tentativas Médias', matematica: 1.5, linguagens: 1.2, ciencias: 2.0, historia: 1.7 },
  ];
  
  const COLORS = ['#8B5D33', '#C17817', '#4A6741', '#E18F1E', '#384F32', '#9A6012'];

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-medieval text-accent">Painel do Professor</h1>
            <p className="text-parchment-dark mt-1">
              Bem-vindo(a), {user?.fullName}. Gerencie e acompanhe o progresso dos alunos.
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" className="border-primary">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatórios
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-light border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/20 rounded-full mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-parchment-dark">Total de Alunos</p>
                  <h3 className="text-2xl font-bold text-parchment">{students.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-light border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/20 rounded-full mr-4">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-parchment-dark">Trilhas Ativas</p>
                  <h3 className="text-2xl font-bold text-parchment">{learningPaths.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-light border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/20 rounded-full mr-4">
                  <GraduationCap className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-parchment-dark">Taxa de Conclusão</p>
                  <h3 className="text-2xl font-bold text-parchment">68%</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-light border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/20 rounded-full mr-4">
                  <Medal className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-parchment-dark">Conquistas Desbloqueadas</p>
                  <h3 className="text-2xl font-bold text-parchment">124</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="bg-dark border border-primary">
            <TabsTrigger value="students" className="data-[state=active]:bg-primary">
              Alunos
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary">
              Desempenho
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-primary">
              Conteúdo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="space-y-4">
            <Card className="bg-dark-light border-primary">
              <CardHeader className="pb-2">
                <CardTitle>Lista de Alunos</CardTitle>
                <CardDescription>
                  Visualize e gerencie os alunos cadastrados no sistema.
                </CardDescription>
                
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-parchment-dark h-4 w-4" />
                    <Input
                      placeholder="Buscar alunos..."
                      className="pl-10 bg-dark border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select 
                    value={selectedArea} 
                    onValueChange={setSelectedArea}
                  >
                    <SelectTrigger className="w-[180px] bg-dark border-primary">
                      <SelectValue placeholder="Filtrar por área" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-light border-primary">
                      <SelectItem value="all">Todas as áreas</SelectItem>
                      <SelectItem value="mathematics">Matemática</SelectItem>
                      <SelectItem value="languages">Linguagens</SelectItem>
                      <SelectItem value="sciences">Ciências</SelectItem>
                      <SelectItem value="history">História</SelectItem>
                      <SelectItem value="geography">Geografia</SelectItem>
                      <SelectItem value="arts">Artes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary hover:bg-transparent">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Último Acesso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id} className="border-primary hover:bg-dark">
                            <TableCell>
                              <AvatarComponent user={student} size="small" />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{student.fullName}</p>
                                <p className="text-xs text-parchment-dark">@{student.username}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-accent text-dark">
                                Nível {student.level}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="w-40">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Geral</span>
                                  <span>65%</span>
                                </div>
                                <Progress value={65} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-parchment-dark">
                                Há 2 dias
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="border-primary">
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum aluno encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle>Desempenho por Área</CardTitle>
                  <CardDescription>
                    Visualize o progresso médio dos alunos em cada área de conhecimento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={areaCompletionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {areaCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Conclusão']}
                          contentStyle={{ backgroundColor: '#2D2A24', borderColor: '#8B5D33' }}
                        />
                        <Legend 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                          formatter={(value) => <span className="text-parchment">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-light border-primary">
                <CardHeader>
                  <CardTitle>Métricas de Desempenho</CardTitle>
                  <CardDescription>
                    Análise comparativa entre as diferentes áreas de conhecimento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={studentPerformanceData}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A6741" opacity={0.3} />
                        <XAxis type="number" tick={{ fill: '#E8D9B5' }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fill: '#E8D9B5' }} 
                          width={120}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#2D2A24', borderColor: '#8B5D33' }}
                        />
                        <Legend
                          formatter={(value) => <span className="text-parchment">{value}</span>}
                        />
                        <Bar dataKey="matematica" name="Matemática" fill="#8B5D33" />
                        <Bar dataKey="linguagens" name="Linguagens" fill="#C17817" />
                        <Bar dataKey="ciencias" name="Ciências" fill="#4A6741" />
                        <Bar dataKey="historia" name="História" fill="#E18F1E" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Análise Detalhada por Missão</CardTitle>
                <CardDescription>
                  Métricas de desempenho para cada missão disponível.
                </CardDescription>
                <div className="flex gap-4 mt-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] bg-dark border-primary">
                      <SelectValue placeholder="Área" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-light border-primary">
                      <SelectItem value="all">Todas as áreas</SelectItem>
                      <SelectItem value="mathematics">Matemática</SelectItem>
                      <SelectItem value="languages">Linguagens</SelectItem>
                      <SelectItem value="sciences">Ciências</SelectItem>
                      <SelectItem value="history">História</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="completion">
                    <SelectTrigger className="w-[180px] bg-dark border-primary">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-light border-primary">
                      <SelectItem value="completion">Taxa de conclusão</SelectItem>
                      <SelectItem value="attempts">Número de tentativas</SelectItem>
                      <SelectItem value="time">Tempo médio</SelectItem>
                      <SelectItem value="difficulty">Dificuldade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary hover:bg-transparent">
                      <TableHead>Missão</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Dificuldade</TableHead>
                      <TableHead>Taxa de Conclusão</TableHead>
                      <TableHead>Tentativas Médias</TableHead>
                      <TableHead>Tempo Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-primary hover:bg-dark">
                      <TableCell>Desafio da Torre</TableCell>
                      <TableCell>
                        <Badge className="bg-secondary text-parchment">Matemática</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {[...Array(3)].map((_, i) => (
                            <Star key={i} filled={true} />
                          ))}
                          {[...Array(2)].map((_, i) => (
                            <Star key={i + 3} filled={false} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="h-2 w-20" />
                          <span>75%</span>
                        </div>
                      </TableCell>
                      <TableCell>2.3</TableCell>
                      <TableCell>18 min</TableCell>
                    </TableRow>
                    
                    <TableRow className="border-primary hover:bg-dark">
                      <TableCell>Segredos do Porto</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500 text-white">Ciências</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {[...Array(2)].map((_, i) => (
                            <Star key={i} filled={true} />
                          ))}
                          {[...Array(3)].map((_, i) => (
                            <Star key={i + 2} filled={false} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={45} className="h-2 w-20" />
                          <span>45%</span>
                        </div>
                      </TableCell>
                      <TableCell>3.1</TableCell>
                      <TableCell>25 min</TableCell>
                    </TableRow>
                    
                    <TableRow className="border-primary hover:bg-dark">
                      <TableCell>Crônicas de Oeiras</TableCell>
                      <TableCell>
                        <Badge className="bg-red-600 text-white">História</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} filled={true} />
                          ))}
                          {[...Array(1)].map((_, i) => (
                            <Star key={i + 4} filled={false} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={60} className="h-2 w-20" />
                          <span>60%</span>
                        </div>
                      </TableCell>
                      <TableCell>2.7</TableCell>
                      <TableCell>30 min</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <Card className="bg-dark-light border-primary">
              <CardHeader>
                <CardTitle>Gestão de Conteúdo</CardTitle>
                <CardDescription>
                  Crie e gerencie trilhas de aprendizagem, missões e conteúdos interativos.
                </CardDescription>
                <div className="flex gap-4 mt-4">
                  <Button className="bg-accent text-dark hover:bg-accent-dark">
                    Nova Trilha
                  </Button>
                  <Button className="bg-secondary text-parchment hover:bg-secondary-dark">
                    Nova Missão
                  </Button>
                  <Button variant="outline" className="border-primary">
                    Gerenciar Questões
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="paths" className="space-y-4">
                  <TabsList className="bg-dark border border-primary">
                    <TabsTrigger value="paths" className="data-[state=active]:bg-primary">
                      Trilhas
                    </TabsTrigger>
                    <TabsTrigger value="missions" className="data-[state=active]:bg-primary">
                      Missões
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-primary">
                      Questões
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="paths">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-primary hover:bg-transparent">
                          <TableHead>Título</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Nível Requerido</TableHead>
                          <TableHead>Missões</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {learningPaths.length > 0 ? (
                          learningPaths.map(path => (
                            <TableRow key={path.id} className="border-primary hover:bg-dark">
                              <TableCell>{path.title}</TableCell>
                              <TableCell>
                                <Badge className={`
                                  ${path.area === 'mathematics' ? 'bg-secondary' : 
                                    path.area === 'languages' ? 'bg-accent' : 
                                    path.area === 'sciences' ? 'bg-blue-500' : 
                                    path.area === 'history' ? 'bg-red-600' : 
                                    path.area === 'geography' ? 'bg-green-500' : 
                                    'bg-purple-500'} 
                                  ${path.area === 'mathematics' || path.area === 'languages' ? 'text-dark' : 'text-white'}
                                `}>
                                  {path.area.charAt(0).toUpperCase() + path.area.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {/* In a real implementation, we would fetch location name */}
                                Teresina
                              </TableCell>
                              <TableCell>Nível {path.requiredLevel}</TableCell>
                              <TableCell>
                                {/* In a real implementation, we would count missions */}
                                3 missões
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  Editar
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500">
                                  Excluir
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow className="border-primary">
                            <TableCell colSpan={6} className="h-24 text-center">
                              Nenhuma trilha encontrada.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="missions">
                    <p className="text-parchment-dark py-4">
                      Gerencie as missões disponíveis em cada trilha de aprendizagem.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="questions">
                    <p className="text-parchment-dark py-4">
                      Crie e edite questões diagnósticas e missões interativas.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Star component for difficulty rating
const Star: React.FC<{ filled: boolean }> = ({ filled }) => {
  return (
    <svg 
      className={`h-4 w-4 ${filled ? 'text-accent' : 'text-parchment-dark'}`} 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
};

export default TeacherDashboard;
