import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Crown, 
  Star, 
  Trophy, 
  Sword, 
  Shield, 
  Map, 
  BookOpen, 
  Target,
  User,
  LogOut,
  MapPin,
  Zap,
  Award,
  ScrollText
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showTriagem, setShowTriagem] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState('mapa');

  // Fetch student data
  const { data: studentData, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['/api/aluno/dados'],
    enabled: !!user
  });

  // Fetch trilhas
  const { data: trilhas = [] } = useQuery({
    queryKey: ['/api/aluno/trilhas'],
    enabled: !!user
  });

  // Fetch missões
  const { data: missoes = [] } = useQuery({
    queryKey: ['/api/aluno/missoes'],
    enabled: !!user
  });

  // Fetch conquistas
  const { data: conquistas = [] } = useQuery({
    queryKey: ['/api/aluno/conquistas'],
    enabled: !!user
  });

  // Fetch ranking
  const { data: ranking = {} } = useQuery({
    queryKey: ['/api/aluno/ranking'],
    enabled: !!user
  });

  // Check if needs triagem - temporarily disabled
  const { data: needsTriagemData } = useQuery({
    queryKey: ['/api/aluno/needs-triagem'],
    enabled: !!user
  });

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-200">Carregando seu reino...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-center text-yellow-200">
          <Crown className="h-16 w-16 mx-auto mb-4" />
          <p>Dados do aventureiro não encontrados</p>
        </div>
      </div>
    );
  }

  const getProgressColor = (progresso: number) => {
    if (progresso >= 80) return 'bg-green-500';
    if (progresso >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNivelFromXP = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
  };

  const getXPParaProximoNivel = (xp: number) => {
    const nivelAtual = getNivelFromXP(xp);
    const xpProximoNivel = nivelAtual * 1000;
    return xpProximoNivel - xp;
  };

  return (
    <div className="min-h-screen bg-[#2D1B0A]">
      {/* Header Padrão do Sistema */}
      <header className="bg-[#3D2817] border-b border-[#5D3F26] px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-[#2D1B0A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F4E4BC] tracking-wide">SABIÁ RPG</h1>
              <p className="text-[#D4AF37] text-sm">Reino do Conhecimento Épico</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-[#5D3F26] px-4 py-2 rounded-lg border border-[#B8860B]">
              <div className="flex items-center gap-2 text-[#F4E4BC]">
                <User className="h-4 w-4" />
                <span className="font-semibold">{studentData.nome}</span>
              </div>
              <div className="text-xs text-[#D4AF37]">
                {studentData.turma_nome} | {studentData.escola_nome}
              </div>
            </div>
            
            <div className="bg-[#5D3F26] px-4 py-2 rounded-lg border border-[#B8860B]">
              <div className="flex items-center gap-2 text-[#F4E4BC]">
                <Star className="h-4 w-4" />
                <span className="font-bold">XP: {studentData.xp_total || 0}</span>
              </div>
              <div className="text-xs text-[#D4AF37]">Nível {studentData.nivel || 1}</div>
            </div>
            
            <Button
              variant="outline"
              onClick={logout}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-[#F4E4BC] border-[#8B4513]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Esquerda - Atributos e Info do Jogador */}
        <div className="w-80 bg-[#3D2817] border-r border-[#5D3F26] p-4 overflow-y-auto">
          {/* Avatar e Info Principal */}
          <div className="bg-[#5D3F26] rounded-lg p-4 mb-6 border border-[#B8860B]">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-[#B8860B] rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#2D1B0A]">
                  {studentData.nome?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AL'}
                </span>
              </div>
              <h3 className="text-[#F4E4BC] font-bold text-lg">{studentData.nome}</h3>
              <p className="text-[#D4AF37] text-sm">{studentData.email}</p>
            </div>

            {/* XP e Nível */}
            <div className="space-y-3">
              <div className="bg-[#4A3224] p-3 rounded border border-[#B8860B]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#F4E4BC] text-sm">Nível {studentData.nivel || 1}</span>
                  <span className="text-[#D4AF37] text-xs">{studentData.xp_total || 0} XP</span>
                </div>
                <Progress 
                  value={((studentData.xp_total || 0) % 1000) / 10} 
                  className="h-2"
                />
                <p className="text-[#D4AF37] text-xs mt-1">
                  {getXPParaProximoNivel(studentData.xp_total || 0)} XP para o próximo nível
                </p>
              </div>
            </div>
          </div>

          {/* Atributos por Componente */}
          <div className="mb-6">
            <h4 className="text-[#F4E4BC] font-bold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              ATRIBUTOS
            </h4>
            <div className="space-y-2">
              {[
                { nome: 'Matemática', progresso: 65, cor: 'bg-blue-500' },
                { nome: 'Linguagens', progresso: 78, cor: 'bg-green-500' },
                { nome: 'Ciências', progresso: 45, cor: 'bg-purple-500' },
                { nome: 'História', progresso: 82, cor: 'bg-red-500' },
                { nome: 'Geografia', progresso: 55, cor: 'bg-yellow-500' },
                { nome: 'Artes', progresso: 70, cor: 'bg-pink-500' }
              ].map((attr, index) => (
                <div key={index} className="bg-[#5D3F26] p-2 rounded border border-[#B8860B]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#F4E4BC] text-sm">{attr.nome}</span>
                    <span className="text-[#D4AF37] text-xs">{attr.progresso}%</span>
                  </div>
                  <div className="w-full bg-[#4A3224] rounded-full h-2">
                    <div 
                      className={`${attr.cor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${attr.progresso}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas Recentes */}
          <div className="mb-6">
            <h4 className="text-[#F4E4BC] font-bold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              CONQUISTAS
            </h4>
            <div className="space-y-2">
              {conquistas.slice(0, 5).map((conquista, index) => (
                <div key={index} className="bg-[#5D3F26] p-2 rounded border border-[#B8860B] flex items-center gap-2">
                  <span className="text-xl">{conquista.icone}</span>
                  <div className="flex-1">
                    <p className="text-[#F4E4BC] text-sm font-medium">{conquista.nome}</p>
                    <p className="text-[#D4AF37] text-xs">{conquista.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-[#5D3F26] rounded-lg p-4 border border-[#B8860B]">
            <h4 className="text-[#F4E4BC] font-bold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              RANKING
            </h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#F4E4BC] mb-1">#{ranking.posicao || 12}</div>
              <p className="text-[#D4AF37] text-sm">de {ranking.total_alunos || 45} alunos</p>
              <div className="mt-2 text-xs text-[#D4AF37]">
                {studentData.turma_nome} | {studentData.ano_serie}
              </div>
            </div>
          </div>
        </div>

        {/* Área Principal - Mapa e Conteúdo */}
        <div className="flex-1 flex flex-col">
          {/* Navegação Superior */}
          <div className="bg-[#3D2817] border-b border-[#5D3F26] p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#5D3F26] border border-[#B8860B]">
                <TabsTrigger value="mapa" className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A] text-[#F4E4BC]">
                  <Map className="h-4 w-4 mr-2" />
                  Mapa
                </TabsTrigger>
                <TabsTrigger value="missoes" className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A] text-[#F4E4BC]">
                  <Sword className="h-4 w-4 mr-2" />
                  Missões
                </TabsTrigger>
                <TabsTrigger value="ranking" className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A] text-[#F4E4BC]">
                  <Trophy className="h-4 w-4 mr-2" />
                  Ranking
                </TabsTrigger>
                <TabsTrigger value="forum" className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A] text-[#F4E4BC]">
                  <ScrollText className="h-4 w-4 mr-2" />
                  Fórum
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#4A3224]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Tab do Mapa */}
              <TabsContent value="mapa" className="mt-0">
                <div className="relative h-full min-h-[600px] bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-lg border border-[#B8860B] overflow-hidden">
                  {/* Mapa Medieval de Fundo */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-90"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23228B22'/%3E%3Cstop offset='50%25' style='stop-color:%2332CD32'/%3E%3Cstop offset='100%25' style='stop-color:%23228B22'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1000' height='600' fill='url(%23bg)'/%3E%3C/svg%3E")`
                    }}
                  ></div>

                  {/* Locais no Mapa */}
                  <div className="relative z-10 h-full p-8">
                    {/* Cidade Central */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-[#B8860B] rounded-full p-6 border-4 border-[#D4AF37] shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <Crown className="h-8 w-8 text-[#2D1B0A]" />
                      </div>
                      <p className="text-center text-[#F4E4BC] font-bold mt-2">Palácio Real</p>
                    </div>

                    {/* Outras Localizações */}
                    {trilhas.map((trilha, index) => {
                      const positions = [
                        { top: '20%', left: '30%' },
                        { top: '30%', right: '25%' },
                        { bottom: '25%', left: '20%' },
                        { bottom: '20%', right: '30%' },
                        { top: '15%', left: '60%' },
                        { bottom: '35%', left: '50%' }
                      ];
                      const pos = positions[index % positions.length];
                      
                      return (
                        <div key={trilha.id} className="absolute" style={pos}>
                          <div className="bg-[#5D3F26] rounded-lg p-4 border border-[#B8860B] shadow-lg cursor-pointer hover:scale-105 transition-transform max-w-48">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-5 w-5 text-[#D4AF37]" />
                              <h4 className="text-[#F4E4BC] font-bold text-sm">{trilha.titulo}</h4>
                            </div>
                            <p className="text-[#D4AF37] text-xs mb-2">{trilha.descricao}</p>
                            <div className="flex justify-between items-center">
                              <Badge variant="secondary" className="bg-[#B8860B] text-[#2D1B0A]">
                                {trilha.progresso}% completo
                              </Badge>
                              <span className="text-[#D4AF37] text-xs">{trilha.nivel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Tab das Missões */}
              <TabsContent value="missoes" className="mt-0">
                <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#F4E4BC]">Missões Disponíveis</h2>
                    <Button className="bg-[#B8860B] hover:bg-[#D4AF37] text-[#2D1B0A]">
                      Ver Todas
                    </Button>
                  </div>

                  <Tabs defaultValue="ativas" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#4A3224]">
                      <TabsTrigger value="ativas" className="text-[#F4E4BC] data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A]">Ativas (4)</TabsTrigger>
                      <TabsTrigger value="disponiveis" className="text-[#F4E4BC] data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A]">Disponíveis (8)</TabsTrigger>
                      <TabsTrigger value="concluidas" className="text-[#F4E4BC] data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#2D1B0A]">Concluídas (12)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="ativas" className="mt-4">
                      {missoes.length === 0 ? (
                        <div className="text-center py-8 text-[#D4AF37]">
                          <Sword className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma missão ativa</p>
                          <p className="text-sm">Inicie uma nova missão no mapa ou na lista de missões disponíveis</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {missoes.map((missao) => (
                            <Card key={missao.id} className="bg-[#4A3224] border-[#B8860B]">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-[#F4E4BC] flex items-center gap-2">
                                  <Sword className="h-5 w-5" />
                                  {missao.titulo}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-[#D4AF37] text-sm mb-3">{missao.descricao}</p>
                                <div className="flex justify-between items-center mb-3">
                                  <Badge className="bg-[#B8860B] text-[#2D1B0A]">
                                    {missao.xp_recompensa} XP
                                  </Badge>
                                  <span className="text-[#D4AF37] text-xs">{missao.dificuldade}</span>
                                </div>
                                <Button 
                                  className="w-full bg-[#B8860B] hover:bg-[#D4AF37] text-[#2D1B0A]"
                                  onClick={() => setSelectedMission(missao)}
                                >
                                  Iniciar Missão
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              {/* Tab do Ranking */}
              <TabsContent value="ranking" className="mt-0">
                <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B]">
                  <h2 className="text-2xl font-bold text-[#F4E4BC] mb-6">Ranking da Turma</h2>
                  
                  <div className="space-y-3">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${
                        i === ranking.posicao - 1 ? 'bg-[#B8860B] border-[#D4AF37]' : 'bg-[#4A3224] border-[#B8860B]'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          i === 0 ? 'bg-[#D4AF37] text-[#2D1B0A]' :
                          i === 1 ? 'bg-gray-300 text-gray-800' :
                          i === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-[#B8860B] text-[#F4E4BC]'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${i === ranking.posicao - 1 ? 'text-[#2D1B0A]' : 'text-[#F4E4BC]'}`}>
                            {i === ranking.posicao - 1 ? studentData.nome : `Aluno ${i + 1}`}
                          </p>
                          <p className={`text-sm ${i === ranking.posicao - 1 ? 'text-[#3D2817]' : 'text-[#D4AF37]'}`}>
                            {studentData.turma_nome}
                          </p>
                        </div>
                        <div className={`text-right ${i === ranking.posicao - 1 ? 'text-[#2D1B0A]' : 'text-[#F4E4BC]'}`}>
                          <p className="font-bold">{2750 - (i * 200)} XP</p>
                          <p className="text-sm">Nível {Math.floor((2750 - (i * 200)) / 1000) + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab do Fórum */}
              <TabsContent value="forum" className="mt-0">
                <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B]">
                  <h2 className="text-2xl font-bold text-[#F4E4BC] mb-6">Fórum da Comunidade</h2>
                  <div className="text-center py-8 text-[#D4AF37]">
                    <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Fórum em desenvolvimento</p>
                    <p className="text-sm">Em breve você poderá interagir com outros aventureiros!</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar Direita - Missão Selecionada */}
        {selectedMission && (
          <div className="w-80 bg-gradient-to-b from-amber-800 to-yellow-900 border-l-4 border-yellow-600 p-4">
            <div className="bg-amber-700 rounded-lg p-4 border-2 border-yellow-600">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-yellow-100 font-bold text-lg">Missão Selecionada</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMission(null)}
                  className="text-yellow-200 hover:text-yellow-100"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-yellow-100 font-semibold">{selectedMission.titulo}</h4>
                  <p className="text-yellow-200 text-sm mt-1">{selectedMission.descricao}</p>
                </div>
                
                <div className="flex gap-2">
                  <Badge className="bg-yellow-600 text-yellow-900">
                    {selectedMission.xp_recompensa} XP
                  </Badge>
                  <Badge variant="outline" className="text-yellow-200 border-yellow-600">
                    {selectedMission.dificuldade}
                  </Badge>
                </div>
                
                <p className="text-yellow-200 text-sm">
                  Selecione uma missão no mapa ou na lista de missões disponíveis.
                </p>
                
                <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-yellow-900">
                  Ver Missões Disponíveis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}