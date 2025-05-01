import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Medal, Search, Filter, Star, BookOpen, Users, School, Home } from 'lucide-react';

interface RankingEntry {
  rank: number;
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  achievements?: number;
  highestScore?: number;
  completedMissions?: number;
}

const RankingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('players');
  const [filterArea, setFilterArea] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFrame, setTimeFrame] = useState('all-time');
  
  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: true,
  });
  
  // Mock fetch schools
  const { data: schools = [] } = useQuery({
    queryKey: ['/api/schools'],
    enabled: false,
    initialData: [
      { id: 1, name: 'Escola Estadual Dom Severino', city: 'Teresina', studentCount: 120, totalXp: 56500, avgLevel: 8 },
      { id: 2, name: 'E. M. Professor João Silva', city: 'Parnaíba', studentCount: 85, totalXp: 42300, avgLevel: 6 },
      { id: 3, name: 'Colégio Piauiense', city: 'Oeiras', studentCount: 95, totalXp: 38750, avgLevel: 5 },
      { id: 4, name: 'Escola Municipal Novo Saber', city: 'Picos', studentCount: 110, totalXp: 35200, avgLevel: 4 },
      { id: 5, name: 'Centro Educacional Asas do Saber', city: 'Teresina', studentCount: 130, totalXp: 31500, avgLevel: 7 },
    ],
  });
  
  // Mock fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['/api/classes'],
    enabled: false,
    initialData: [
      { id: 1, name: '9º Ano A', school: 'Escola Estadual Dom Severino', studentCount: 28, totalXp: 12500, avgLevel: 8 },
      { id: 2, name: '8º Ano B', school: 'E. M. Professor João Silva', studentCount: 25, totalXp: 10300, avgLevel: 6 },
      { id: 3, name: '2º Ano Ensino Médio', school: 'Colégio Piauiense', studentCount: 30, totalXp: 9750, avgLevel: 7 },
      { id: 4, name: '1º Ano Ensino Médio', school: 'Escola Municipal Novo Saber', studentCount: 32, totalXp: 8200, avgLevel: 5 },
      { id: 5, name: '3º Ano Ensino Médio', school: 'Centro Educacional Asas do Saber', studentCount: 27, totalXp: 7900, avgLevel: 9 },
    ],
  });
  
  // Create player rankings from users
  const playerRankings: RankingEntry[] = usersLoading
    ? []
    : users
        .filter(u => u.role === 'student')
        .map((u, index) => ({
          rank: index + 1,
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          level: u.level,
          xp: u.xp,
          achievements: Math.floor(Math.random() * 10), // Mock data
          highestScore: Math.floor(Math.random() * 50 + 50), // Mock data
          completedMissions: Math.floor(Math.random() * 20), // Mock data
        }))
        .sort((a, b) => b.xp - a.xp);
  
  // Filter rankings based on search term and area
  const filteredRankings = playerRankings.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Get the user's ranking
  const userRanking = user ? playerRankings.find(entry => entry.id === user.id) : null;

  // Format XP with separators
  const formatXP = (xp: number) => {
    return xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medieval text-accent">Ranking</h1>
          <p className="text-parchment-dark">
            Confira a classificação dos jogadores, escolas e turmas
          </p>
        </div>
        
        {/* User's current ranking */}
        {userRanking && (
          <Card className="bg-primary-dark border-accent mb-8">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-6 hidden sm:block">
                    <div className="text-3xl font-bold text-accent text-center">#{userRanking.rank}</div>
                    <div className="text-xs text-parchment-dark">sua posição</div>
                  </div>
                  
                  <div className="flex items-center">
                    <Avatar user={user} size="medium" showBadge={true} />
                    <div className="ml-3">
                      <div className="font-medieval text-lg text-parchment">{user.username}</div>
                      <div className="text-sm text-parchment-dark">
                        <span className="sm:hidden mr-2">#{userRanking.rank}</span>
                        Nível {user.level}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{formatXP(user.xp)}</div>
                    <div className="text-xs text-parchment-dark">Pontos XP</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-parchment">{userRanking.achievements}</div>
                    <div className="text-xs text-parchment-dark">Conquistas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-parchment">{userRanking.completedMissions}</div>
                    <div className="text-xs text-parchment-dark">Missões</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="bg-dark border border-primary">
              <TabsTrigger value="players" className="data-[state=active]:bg-primary">
                <Trophy className="mr-2 h-4 w-4" />
                Jogadores
              </TabsTrigger>
              <TabsTrigger value="schools" className="data-[state=active]:bg-primary">
                <School className="mr-2 h-4 w-4" />
                Escolas
              </TabsTrigger>
              <TabsTrigger value="classes" className="data-[state=active]:bg-primary">
                <Users className="mr-2 h-4 w-4" />
                Turmas
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-parchment-dark h-4 w-4" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 bg-dark border-primary w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="bg-dark border-primary w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-dark-light border-primary">
                  <SelectItem value="all-time">Todo o tempo</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="trimester">Este trimestre</SelectItem>
                </SelectContent>
              </Select>
              
              {activeTab === 'players' && (
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger className="bg-dark border-primary w-[150px]">
                    <SelectValue placeholder="Área" />
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
              )}
            </div>
          </div>
          
          <TabsContent value="players" className="mt-0">
            <Card className="bg-dark-light border-primary">
              <CardHeader className="pb-2">
                <CardTitle>Ranking de Jogadores</CardTitle>
                <CardDescription>
                  Os jogadores mais bem classificados baseados em XP {timeFrame === 'all-time' ? 'de todo o tempo' : timeFrame === 'week' ? 'desta semana' : timeFrame === 'month' ? 'deste mês' : 'deste trimestre'}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {usersLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
                    </div>
                  ) : filteredRankings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-primary hover:bg-transparent">
                          <TableHead className="w-16 text-center">Rank</TableHead>
                          <TableHead>Jogador</TableHead>
                          <TableHead className="text-center">Nível</TableHead>
                          <TableHead className="text-right">XP</TableHead>
                          <TableHead className="text-center">Conquistas</TableHead>
                          <TableHead className="text-center">Missões</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRankings.map((entry) => (
                          <TableRow 
                            key={entry.id} 
                            className={`border-primary hover:bg-dark transition-colors ${entry.id === user?.id ? 'bg-primary/20' : ''}`}
                          >
                            <TableCell className="text-center">
                              {entry.rank <= 3 ? (
                                <div className={`
                                  inline-flex items-center justify-center w-8 h-8 rounded-full
                                  ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                                    entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' : 
                                    'bg-amber-700/20 text-amber-700'}
                                `}>
                                  <Trophy className="h-5 w-5" />
                                </div>
                              ) : (
                                <span className="text-parchment-dark font-medium">#{entry.rank}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar user={entry} size="small" />
                                <div className="ml-3">
                                  <div className="font-medium">{entry.username}</div>
                                  <div className="text-xs text-parchment-dark">{entry.fullName}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-accent text-dark">
                                {entry.level}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatXP(entry.xp)}
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.achievements}
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.completedMissions}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-12 text-center">
                      <Trophy className="h-16 w-16 text-primary-dark mx-auto mb-4 opacity-30" />
                      <p className="text-parchment-dark">Nenhum jogador encontrado</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schools" className="mt-0">
            <Card className="bg-dark-light border-primary">
              <CardHeader className="pb-2">
                <CardTitle>Ranking de Escolas</CardTitle>
                <CardDescription>
                  As escolas mais bem classificadas baseadas no desempenho coletivo de seus alunos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary hover:bg-transparent">
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Escola</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead className="text-center">Alunos</TableHead>
                      <TableHead className="text-right">XP Total</TableHead>
                      <TableHead className="text-center">Nível Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((school: any, index: number) => (
                      <TableRow key={school.id} className="border-primary hover:bg-dark">
                        <TableCell className="text-center">
                          {index < 3 ? (
                            <div className={`
                              inline-flex items-center justify-center w-8 h-8 rounded-full
                              ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                                index === 1 ? 'bg-gray-400/20 text-gray-400' : 
                                'bg-amber-700/20 text-amber-700'}
                            `}>
                              <Trophy className="h-5 w-5" />
                            </div>
                          ) : (
                            <span className="text-parchment-dark font-medium">#{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{school.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-1 text-parchment-dark" />
                            <span>{school.city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Users className="h-4 w-4 mr-1 text-parchment-dark" />
                            <span>{school.studentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatXP(school.totalXp)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-secondary text-dark">
                            {school.avgLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="classes" className="mt-0">
            <Card className="bg-dark-light border-primary">
              <CardHeader className="pb-2">
                <CardTitle>Ranking de Turmas</CardTitle>
                <CardDescription>
                  As turmas mais bem classificadas baseadas no desempenho coletivo de seus alunos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary hover:bg-transparent">
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Escola</TableHead>
                      <TableHead className="text-center">Alunos</TableHead>
                      <TableHead className="text-right">XP Total</TableHead>
                      <TableHead className="text-center">Nível Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem: any, index: number) => (
                      <TableRow key={classItem.id} className="border-primary hover:bg-dark">
                        <TableCell className="text-center">
                          {index < 3 ? (
                            <div className={`
                              inline-flex items-center justify-center w-8 h-8 rounded-full
                              ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                                index === 1 ? 'bg-gray-400/20 text-gray-400' : 
                                'bg-amber-700/20 text-amber-700'}
                            `}>
                              <Trophy className="h-5 w-5" />
                            </div>
                          ) : (
                            <span className="text-parchment-dark font-medium">#{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{classItem.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <School className="h-4 w-4 mr-1 text-parchment-dark" />
                            <span>{classItem.school}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Users className="h-4 w-4 mr-1 text-parchment-dark" />
                            <span>{classItem.studentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatXP(classItem.totalXp)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-secondary text-dark">
                            {classItem.avgLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Top 3 medals section */}
        <div className="mt-10">
          <h2 className="text-2xl font-medieval text-accent mb-6">Destaques da Semana</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {playerRankings.slice(0, 3).map((entry, index) => (
              <Card key={entry.id} className={`
                border-none shadow-lg
                ${index === 0 ? 'bg-yellow-500/10 border-yellow-500' : 
                  index === 1 ? 'bg-gray-400/10 border-gray-400' : 
                  'bg-amber-700/10 border-amber-700'}
              `}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`
                      mb-4 p-2 rounded-full
                      ${index === 0 ? 'bg-yellow-500/20' : 
                        index === 1 ? 'bg-gray-400/20' : 
                        'bg-amber-700/20'}
                    `}>
                      <Trophy className={`
                        h-8 w-8
                        ${index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-amber-700'}
                      `} />
                    </div>
                    
                    <div className="relative mb-4">
                      <div className={`
                        absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center
                        ${index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-amber-700'}
                      `}>
                        <span className="text-dark font-bold">{index + 1}</span>
                      </div>
                      <Avatar user={entry} size="large" showBadge={true} />
                    </div>
                    
                    <h3 className="font-medieval text-xl mb-1">{entry.username}</h3>
                    <p className="text-sm text-parchment-dark">{entry.fullName}</p>
                    
                    <div className="mt-4 space-y-2 w-full">
                      <div className="flex justify-between">
                        <span>XP Total:</span>
                        <span className="font-bold">{formatXP(entry.xp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conquistas:</span>
                        <span>{entry.achievements}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maior Pontuação:</span>
                        <span>{entry.highestScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
