import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const [activeTab, setActiveTab] = useState('mapa');
  const [selectedMission, setSelectedMission] = useState(null);

  // Query dos dados do aluno
  const { data: studentData = {}, isLoading: studentLoading } = useQuery({
    queryKey: ['/api/aluno/dados'],
    enabled: !!user?.id
  });

  const { data: conquistas = [], isLoading: conquistasLoading } = useQuery({
    queryKey: ['/api/aluno/conquistas'],
    enabled: !!user?.id
  });

  const { data: ranking = [], isLoading: rankingLoading } = useQuery({
    queryKey: ['/api/aluno/ranking'],
    enabled: !!user?.id
  });

  const { data: trilhas = [], isLoading: trilhasLoading } = useQuery({
    queryKey: ['/api/aluno/trilhas'],
    enabled: !!user?.id
  });

  const { data: missoes = [], isLoading: missoesLoading } = useQuery({
    queryKey: ['/api/aluno/missoes'],
    enabled: !!user?.id
  });

  if (studentLoading) {
    return (
      <div className="min-h-screen bg-[#2D1B0A] flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-12 w-12 text-[#B8860B] mx-auto mb-4 animate-spin" />
          <p className="text-[#F4E4BC] text-lg">Carregando seu reino...</p>
        </div>
      </div>
    );
  }

  const getXPParaProximoNivel = (xp: number) => {
    const nivelAtual = Math.floor(xp / 1000) + 1;
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
                {studentData.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AL'}
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
                {studentData.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AL'}
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
                { nome: 'Matemática', progresso: 0 },
                { nome: 'Linguagens', progresso: 0 },
                { nome: 'Ciências', progresso: 0 },
                { nome: 'História', progresso: 0 },
                { nome: 'Geografia', progresso: 0 },
                { nome: 'Artes', progresso: 0 }
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
                    {trilhas && Array.isArray(trilhas) && trilhas.map((trilha: any, index: number) => {
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
                  <p className="text-sm mt-2">Inicie uma nova missão disponível para continuar sua jornada</p>
                </div>
              </div>
            </div>
          )}

          {/* Outras abas */}
          {activeTab === 'missoes' && (
            <div className="flex-1 p-4">
              <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B]">
                <h2 className="text-2xl font-bold text-[#F4E4BC] mb-6">Missões Disponíveis</h2>
                <div className="text-center py-8 text-[#D4AF37]">
                  <Sword className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma missão disponível</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="flex-1 p-4">
              <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B]">
                <h2 className="text-2xl font-bold text-[#F4E4BC] mb-6">Ranking dos Estudantes</h2>
                <div className="text-center py-8 text-[#D4AF37]">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Carregando ranking...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forum' && (
            <div className="flex-1 p-4">
              <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B] text-center">
                <ScrollText className="h-12 w-12 mx-auto mb-4 text-[#D4AF37] opacity-50" />
                <h2 className="text-2xl font-bold text-[#F4E4BC] mb-4">Fórum da Comunidade</h2>
                <p className="text-[#D4AF37] mb-6">
                  Compartilhe conhecimento e tire dúvidas com outros aventureiros do reino
                </p>
                <Button className="bg-[#B8860B] hover:bg-[#D4AF37] text-[#2D1B0A]">
                  Em Breve
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Direita - Painel de Missão */}
        <div className="w-80 bg-[#3D2817] border-l border-[#5D3F26] p-4">
          <div className="bg-[#5D3F26] rounded-lg p-6 border border-[#B8860B] text-center">
            <div className="w-16 h-16 bg-[#4A3224] rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-[#B8860B]">
              <span className="text-4xl text-[#D4AF37]">?</span>
            </div>
            <h3 className="text-[#F4E4BC] font-bold text-lg mb-2">Nenhuma Missão Selecionada</h3>
            <p className="text-[#D4AF37] text-sm mb-4">
              Selecione uma missão no mapa ou na lista de missões disponíveis
            </p>
            <Button className="bg-[#B8860B] hover:bg-[#D4AF37] text-[#2D1B0A]">
              Ver Missões Disponíveis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}