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
  ScrollText,
  MessageCircle,
  Bell
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
      {/* Header com navegação centralizada */}
      <header className="bg-[#3D2817] border-b border-[#5D3F26] px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo à esquerda */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B8860B] rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-[#2D1B0A]" />
            </div>
            <span className="text-xl font-bold text-[#F4E4BC]">SABIÁ RPG</span>
          </div>
          
          {/* Navegação central */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'mapa'
                  ? 'bg-[#B8860B] text-[#2D1B0A]'
                  : 'text-[#F4E4BC] hover:bg-[#5D3F26]'
              }`}
            >
              <Map className="h-4 w-4" />
              Mapa
            </button>
            <button
              onClick={() => setActiveTab('missoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'missoes'
                  ? 'bg-[#B8860B] text-[#2D1B0A]'
                  : 'text-[#F4E4BC] hover:bg-[#5D3F26]'
              }`}
            >
              <Sword className="h-4 w-4" />
              Missões
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'ranking'
                  ? 'bg-[#B8860B] text-[#2D1B0A]'
                  : 'text-[#F4E4BC] hover:bg-[#5D3F26]'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Ranking
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'forum'
                  ? 'bg-[#B8860B] text-[#2D1B0A]'
                  : 'text-[#F4E4BC] hover:bg-[#5D3F26]'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Fórum
            </button>
          </div>
          
          {/* Info do usuário à direita */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-[#F4E4BC]" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
            <span className="text-[#F4E4BC] text-sm">★ {studentData.xp_total || 0}XP | Nível {studentData.nivel || 1}</span>
            <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center border-2 border-[#F4E4BC] cursor-pointer"
                 onClick={logout}>
              <span className="text-[#2D1B0A] text-sm font-bold">
                {studentData.nome?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AL'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar Esquerda - Perfil do Aluno */}
        <div className="w-72 bg-[#3D2817] border-r border-[#5D3F26] p-4 overflow-y-auto">
          {/* Avatar e Info Principal */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#B8860B] rounded-full mx-auto mb-3 flex items-center justify-center border-4 border-white">
              <span className="text-2xl font-bold text-[#2D1B0A]">
                {studentData.nome?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AL'}
              </span>
            </div>
            <p className="text-[#D4AF37] text-sm mb-1">{studentData.email || 'aluno@sabiarpg.edu.br'}</p>
            <p className="text-[#F4E4BC] text-xs">Aprendiz de Sabedoria</p>
          </div>

          {/* Atributos por Componente */}
          <div className="mb-6">
            <h4 className="text-[#F4E4BC] font-bold mb-3 text-sm">ATRIBUTOS</h4>
            <div className="space-y-3">
              {[
                { nome: 'Matemática', progresso: 0, cor: 'bg-blue-500' },
                { nome: 'Linguagens', progresso: 0, cor: 'bg-green-500' },
                { nome: 'Ciências', progresso: 0, cor: 'bg-purple-500' },
                { nome: 'História', progresso: 0, cor: 'bg-red-500' },
                { nome: 'Geografia', progresso: 0, cor: 'bg-yellow-500' },
                { nome: 'Artes', progresso: 0, cor: 'bg-pink-500' }
              ].map((attr, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-[#F4E4BC] text-xs">{attr.nome}</span>
                  <span className="text-[#D4AF37] text-xs">{attr.progresso}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas */}
          <div className="mb-6">
            <h4 className="text-[#F4E4BC] font-bold mb-3 text-sm">CONQUISTAS</h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border border-[#5D3F26] bg-[#2D1B0A] flex items-center justify-center">
                  <span className="text-[#5D3F26] text-xs">—</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nível */}
          <div className="bg-[#5D3F26] rounded-lg p-4 border border-[#B8860B]">
            <h4 className="text-[#F4E4BC] font-bold mb-3 text-sm">NÍVEL</h4>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F4E4BC] mb-1">Nível 1</div>
              <p className="text-[#D4AF37] text-xs">0/1000 XP</p>
            </div>
          </div>
        </div>

        {/* Área Principal - Conteúdo baseado na tab ativa */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'mapa' && (
            <div className="flex-1 flex flex-col">
              {/* Mapa Medieval */}
              <div className="flex-1 p-4">
                <div className="relative h-full min-h-[400px] bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-lg overflow-hidden">
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
                    {trilhas && trilhas.map((trilha, index) => {
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
              </div>

              {/* Seção de Missões abaixo do mapa */}
              <div className="p-4 bg-[#3D2817] border-t border-[#5D3F26]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#F4E4BC]">Missões</h2>
                  <Button className="bg-[#B8860B] hover:bg-[#D4AF37] text-[#2D1B0A] text-sm">
                    Ver Todas
                  </Button>
                </div>

                <div className="flex gap-4 mb-4">
                  <button className="px-4 py-2 bg-[#B8860B] text-[#2D1B0A] rounded text-sm">
                    Ativas (0)
                  </button>
                  <button className="px-4 py-2 bg-[#5D3F26] text-[#F4E4BC] rounded text-sm hover:bg-[#6B4A32]">
                    Disponíveis (0)
                  </button>
                  <button className="px-4 py-2 bg-[#5D3F26] text-[#F4E4BC] rounded text-sm hover:bg-[#6B4A32]">
                    Concluídas (0)
                  </button>
                </div>

                <div className="text-center py-8 text-[#D4AF37]">
                  <p>Nenhuma missão ativa</p>
                  <p className="text-sm mt-2">Inicie uma nova missão no mapa ou na lista de missões disponíveis</p>
                </div>
              </div>
            </div>
          )}

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
          <div className="w-80 bg-[#3D2817] border-l border-[#5D3F26] p-4">
            <div className="bg-[#5D3F26] rounded-lg p-4 border border-[#B8860B]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#F4E4BC] font-bold text-lg">Missão Selecionada</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMission(null)}
                  className="text-[#D4AF37] hover:text-[#F4E4BC]"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[#F4E4BC] font-semibold">{selectedMission.titulo}</h4>
                  <p className="text-[#D4AF37] text-sm mt-1">{selectedMission.descricao}</p>
                </div>
                
                <div className="flex gap-2">
                  <Badge className="bg-[#B8860B] text-[#2D1B0A]">
                    {selectedMission.xp_recompensa} XP
                  </Badge>
                  <Badge variant="outline" className="text-[#D4AF37] border-[#B8860B]">
                    {selectedMission.dificuldade}
                  </Badge>
                </div>
                
                <p className="text-[#D4AF37] text-sm">
                  Selecione uma missão no mapa ou na lista de missões disponíveis.
                </p>
                
                <Button className="w-full bg-[#B8860B] hover:bg-[#D4AF37] text-[#2D1B0A]">
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