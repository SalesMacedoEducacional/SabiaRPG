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

  // Dados padrão para exibição
  const dadosAluno = {
    nome: (studentData as any)?.nome || user?.nome || 'Aluno Teste',
    email: (studentData as any)?.email || user?.email || 'aluno@sabiarpg.edu.br',
    xp_total: (studentData as any)?.xp_total || 0,
    nivel: (studentData as any)?.nivel || 1
  };

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

  return (
    <div className="min-h-screen bg-[#2A1810]">
      {/* Header exato da referência */}
      <header className="bg-[#3B2317] border-b-2 border-[#8B7355] px-6 py-2">
        <div className="flex justify-between items-center">
          {/* Logo SABIÁ RPG */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center border-2 border-[#F4E4BC]">
              <Crown className="h-6 w-6 text-[#2D1B0A]" />
            </div>
            <span className="text-2xl font-bold text-[#F4E4BC] tracking-wider">SABIÁ RPG</span>
          </div>
          
          {/* Navegação central */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
                activeTab === 'mapa'
                  ? 'bg-[#D4AF37] text-[#2D1B0A] border-[#F4E4BC] shadow-lg'
                  : 'bg-[#5D4E37] text-[#F4E4BC] border-[#8B7355] hover:bg-[#6B5A42]'
              }`}
            >
              <Map className="h-5 w-5" />
              Mapa
            </button>
            <button
              onClick={() => setActiveTab('missoes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
                activeTab === 'missoes'
                  ? 'bg-[#D4AF37] text-[#2D1B0A] border-[#F4E4BC] shadow-lg'
                  : 'bg-[#5D4E37] text-[#F4E4BC] border-[#8B7355] hover:bg-[#6B5A42]'
              }`}
            >
              <Sword className="h-5 w-5" />
              Missões
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
                activeTab === 'ranking'
                  ? 'bg-[#D4AF37] text-[#2D1B0A] border-[#F4E4BC] shadow-lg'
                  : 'bg-[#5D4E37] text-[#F4E4BC] border-[#8B7355] hover:bg-[#6B5A42]'
              }`}
            >
              <Trophy className="h-5 w-5" />
              Ranking
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
                activeTab === 'forum'
                  ? 'bg-[#D4AF37] text-[#2D1B0A] border-[#F4E4BC] shadow-lg'
                  : 'bg-[#5D4E37] text-[#F4E4BC] border-[#8B7355] hover:bg-[#6B5A42]'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              Fórum
            </button>
          </div>
          
          {/* Info do usuário */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-[#F4E4BC] cursor-pointer hover:text-[#D4AF37]" />
              <span className="absolute -top-2 -right-2 bg-[#DC2626] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                1
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#5D4E37] px-4 py-2 rounded-lg border border-[#8B7355]">
              <Star className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-[#F4E4BC] font-bold">{dadosAluno.xp_total} XP</span>
              <span className="text-[#D4AF37] text-sm">| Nível {dadosAluno.nivel}</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center border-2 border-[#F4E4BC] cursor-pointer hover:scale-105 transition-transform"
                 onClick={logout}>
              <span className="text-[#2D1B0A] text-sm font-bold">
                {dadosAluno.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AL'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Esquerda - Perfil do Aluno */}
        <div className="w-80 bg-[#3B2317] border-r-2 border-[#8B7355] p-6 overflow-y-auto">
          {/* Avatar e Info Principal */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#F4E4BC] shadow-lg">
              <span className="text-3xl font-bold text-[#2D1B0A]">
                {dadosAluno.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AL'}
              </span>
            </div>
            <p className="text-[#D4AF37] text-sm mb-1 font-medium">{dadosAluno.email}</p>
            <p className="text-[#F4E4BC] text-xs bg-[#5D4E37] px-3 py-1 rounded-full inline-block border border-[#8B7355]">
              Aprendiz de Sabedoria
            </p>
          </div>

          {/* Atributos por Componente */}
          <div className="mb-8">
            <h4 className="text-[#F4E4BC] font-bold mb-4 text-sm tracking-wider border-b border-[#8B7355] pb-2">ATRIBUTOS</h4>
            <div className="space-y-4">
              {[
                { nome: 'Matemática', progresso: 0, cor: '#3B82F6' },
                { nome: 'Linguagens', progresso: 0, cor: '#10B981' },
                { nome: 'Ciências', progresso: 0, cor: '#8B5CF6' },
                { nome: 'História', progresso: 0, cor: '#EF4444' },
                { nome: 'Geografia', progresso: 0, cor: '#F59E0B' },
                { nome: 'Artes', progresso: 0, cor: '#EC4899' }
              ].map((attr, index) => (
                <div key={index} className="bg-[#4A3428] p-3 rounded-lg border border-[#8B7355]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#F4E4BC] text-sm font-medium">{attr.nome}</span>
                    <span className="text-[#D4AF37] text-sm font-bold">{attr.progresso}%</span>
                  </div>
                  <div className="w-full bg-[#2A1810] rounded-full h-2 border border-[#5D4E37]">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${attr.progresso}%`,
                        backgroundColor: attr.cor
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas */}
          <div className="mb-8">
            <h4 className="text-[#F4E4BC] font-bold mb-4 text-sm tracking-wider border-b border-[#8B7355] pb-2">CONQUISTAS</h4>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#8B7355] bg-[#4A3428] flex items-center justify-center hover:border-[#D4AF37] transition-colors">
                  <span className="text-[#8B7355] text-lg">—</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nível */}
          <div className="bg-gradient-to-br from-[#5D4E37] to-[#4A3428] rounded-lg p-6 border-2 border-[#8B7355] shadow-lg">
            <h4 className="text-[#F4E4BC] font-bold mb-4 text-sm tracking-wider text-center">NÍVEL</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4AF37] mb-2">Nível {dadosAluno.nivel}</div>
              <div className="text-[#F4E4BC] text-sm mb-3">{dadosAluno.xp_total}/1000 XP</div>
              <div className="w-full bg-[#2A1810] rounded-full h-3 border border-[#8B7355]">
                <div 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(dadosAluno.xp_total % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Área Principal - Mapa */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'mapa' && (
            <div className="flex-1 flex flex-col">
              {/* Mapa Medieval Exato da Referência */}
              <div className="flex-1 p-6">
                <div className="relative h-full min-h-[600px] rounded-xl overflow-hidden border-2 border-[#8B7355] shadow-2xl" 
                     style={{
                       background: 'linear-gradient(135deg, #8B7355 0%, #A0916F 15%, #7A9B76 35%, #6B8E6B 55%, #A0916F 75%, #8B7355 100%)'
                     }}>
                  
                  {/* Rio serpenteante com sombra */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#2A1810" floodOpacity="0.6"/>
                      </filter>
                    </defs>
                    <path d="M0,350 Q250,250 500,350 Q750,450 1000,350" 
                          stroke="#4A90E2" strokeWidth="60" fill="none" opacity="0.8" filter="url(#shadow)"/>
                    <path d="M0,350 Q250,250 500,350 Q750,450 1000,350" 
                          stroke="#87CEEB" strokeWidth="40" fill="none" opacity="0.9"/>
                  </svg>

                  {/* Montanhas com gradiente */}
                  <div className="absolute top-0 left-0 w-full h-2/5 opacity-40">
                    <svg viewBox="0 0 1000 300" className="w-full h-full">
                      <defs>
                        <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8B4513" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#654321" stopOpacity="0.9"/>
                        </linearGradient>
                      </defs>
                      <polygon points="0,300 150,80 300,300" fill="url(#mountain1)"/>
                      <polygon points="200,300 350,50 500,300" fill="#5D4037" opacity="0.8"/>
                      <polygon points="400,300 550,90 700,300" fill="url(#mountain1)"/>
                      <polygon points="600,300 750,60 900,300" fill="#5D4037" opacity="0.7"/>
                      <polygon points="800,300 950,100 1000,300" fill="url(#mountain1)"/>
                    </svg>
                  </div>

                  {/* Locais do Mapa com Design Exato */}
                  <div className="relative z-10 h-full p-10">
                    
                    {/* Castelo Principal - Centro */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative group cursor-pointer">
                        <div className="w-32 h-36 bg-gradient-to-b from-[#8B4513] to-[#654321] border-4 border-[#F4E4BC] rounded-t-2xl shadow-2xl">
                          <div className="w-full h-6 bg-[#654321] mt-3 border-b-2 border-[#8B4513]"></div>
                          <div className="flex justify-center mt-4">
                            <Crown className="h-12 w-12 text-[#FFD700] drop-shadow-lg" />
                          </div>
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-4 h-8 bg-[#DC2626] rounded-t-full border border-[#F4E4BC]"></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                          <p className="text-center text-[#F4E4BC] font-bold text-sm bg-[#2A1810] px-4 py-2 rounded-lg border-2 border-[#D4AF37] shadow-lg">
                            CASTELO
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vila da Matemática - Norte */}
                    <div className="absolute top-[12%] left-[18%]">
                      <div className="relative group cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] rounded-xl border-3 border-[#F4E4BC] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                          <span className="text-white text-lg font-bold">M</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-2 bg-[#2A1810] px-2 py-1 rounded border border-[#3B82F6] font-medium">
                          MATEMÁTICA
                        </p>
                      </div>
                    </div>

                    {/* Vila das Linguagens - Nordeste */}
                    <div className="absolute top-[18%] right-[22%]">
                      <div className="relative group cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#047857] rounded-xl border-3 border-[#F4E4BC] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                          <span className="text-white text-lg font-bold">L</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-2 bg-[#2A1810] px-2 py-1 rounded border border-[#10B981] font-medium">
                          LINGUAGENS
                        </p>
                      </div>
                    </div>

                    {/* Torre das Ciências - Leste */}
                    <div className="absolute top-[40%] right-[12%]">
                      <div className="relative group cursor-pointer">
                        <div className="w-12 h-20 bg-gradient-to-b from-[#8B5CF6] to-[#6B46C1] rounded-t-full border-3 border-[#F4E4BC] flex items-end justify-center pb-2 shadow-xl hover:scale-110 transition-transform">
                          <span className="text-white text-sm font-bold">C</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-2 bg-[#2A1810] px-2 py-1 rounded border border-[#8B5CF6] font-medium">
                          CIÊNCIAS
                        </p>
                      </div>
                    </div>

                    {/* Biblioteca da História - Sul */}
                    <div className="absolute bottom-[22%] left-[28%]">
                      <div className="relative group cursor-pointer">
                        <div className="w-18 h-14 bg-gradient-to-br from-[#EF4444] to-[#DC2626] border-3 border-[#F4E4BC] flex items-center justify-center shadow-xl hover:scale-110 transition-transform rounded-lg">
                          <span className="text-white text-lg font-bold">H</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-2 bg-[#2A1810] px-2 py-1 rounded border border-[#EF4444] font-medium">
                          HISTÓRIA
                        </p>
                      </div>
                    </div>

                    {/* Observatório da Geografia - Sudeste */}
                    <div className="absolute bottom-[28%] right-[18%]">
                      <div className="relative group cursor-pointer">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full border-3 border-[#F4E4BC] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                          <span className="text-white text-sm font-bold">G</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-2 bg-[#2A1810] px-2 py-1 rounded border border-[#F59E0B] font-medium">
                          GEOGRAFIA
                        </p>
                      </div>
                    </div>

                    {/* Ateliê das Artes - Oeste */}
                    <div className="absolute top-[48%] left-[8%]">
                      <div className="relative group cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-xl border-3 border-[#F4E4BC] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                          <span className="text-white text-lg font-bold">A</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-2 bg-[#2A1810] px-2 py-1 rounded border border-[#EC4899] font-medium">
                          ARTES
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Controles de zoom estilizados */}
                  <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-gradient-to-br from-[#5D4E37] to-[#4A3428] border-2 border-[#D4AF37] rounded-lg flex items-center justify-center text-[#F4E4BC] hover:bg-[#6B5A42] transition-all shadow-lg font-bold text-lg">
                      +
                    </button>
                    <button className="w-10 h-10 bg-gradient-to-br from-[#5D4E37] to-[#4A3428] border-2 border-[#D4AF37] rounded-lg flex items-center justify-center text-[#F4E4BC] hover:bg-[#6B5A42] transition-all shadow-lg font-bold text-lg">
                      −
                    </button>
                  </div>
                </div>
              </div>

              {/* Seção de Missões */}
              <div className="p-6 bg-[#3B2317] border-t-2 border-[#8B7355]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#F4E4BC] tracking-wide">Missões</h2>
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E6C200] hover:to-[#D4AF37] text-[#2D1B0A] font-bold px-6 py-2 border-2 border-[#F4E4BC] shadow-lg">
                    Ver Todas
                  </Button>
                </div>

                <div className="flex gap-4 mb-6">
                  <button className="px-6 py-3 bg-[#D4AF37] text-[#2D1B0A] rounded-lg font-bold border-2 border-[#F4E4BC] shadow-lg">
                    Ativas (0)
                  </button>
                  <button className="px-6 py-3 bg-[#5D4E37] text-[#F4E4BC] rounded-lg font-semibold border-2 border-[#8B7355] hover:bg-[#6B5A42] transition-colors">
                    Disponíveis (0)
                  </button>
                  <button className="px-6 py-3 bg-[#5D4E37] text-[#F4E4BC] rounded-lg font-semibold border-2 border-[#8B7355] hover:bg-[#6B5A42] transition-colors">
                    Concluídas (0)
                  </button>
                </div>

                <div className="text-center py-12 bg-[#4A3428] rounded-xl border-2 border-[#8B7355]">
                  <p className="text-[#D4AF37] text-lg font-semibold">Nenhuma missão ativa</p>
                  <p className="text-[#F4E4BC] text-sm mt-2">Inicie uma nova missão disponível para continuar sua jornada</p>
                </div>
              </div>
            </div>
          )}

          {/* Outras abas */}
          {activeTab === 'missoes' && (
            <div className="flex-1 p-6">
              <div className="bg-[#4A3428] rounded-xl p-8 border-2 border-[#8B7355] h-full flex items-center justify-center">
                <div className="text-center">
                  <Sword className="h-16 w-16 mx-auto mb-4 text-[#D4AF37] opacity-50" />
                  <h2 className="text-2xl font-bold text-[#F4E4BC] mb-2">Missões Disponíveis</h2>
                  <p className="text-[#D4AF37]">Nenhuma missão disponível no momento</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="flex-1 p-6">
              <div className="bg-[#4A3428] rounded-xl p-8 border-2 border-[#8B7355] h-full flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-[#D4AF37] opacity-50" />
                  <h2 className="text-2xl font-bold text-[#F4E4BC] mb-2">Ranking dos Estudantes</h2>
                  <p className="text-[#D4AF37]">Carregando dados do ranking...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forum' && (
            <div className="flex-1 p-6">
              <div className="bg-[#4A3428] rounded-xl p-8 border-2 border-[#8B7355] h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-[#D4AF37] opacity-50" />
                  <h2 className="text-2xl font-bold text-[#F4E4BC] mb-4">Fórum da Comunidade</h2>
                  <p className="text-[#D4AF37] mb-6">
                    Compartilhe conhecimento e tire dúvidas com outros aventureiros do reino
                  </p>
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E6C200] hover:to-[#D4AF37] text-[#2D1B0A] font-bold border-2 border-[#F4E4BC]">
                    Em Breve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Direita - Painel de Missão */}
        <div className="w-80 bg-[#3B2317] border-l-2 border-[#8B7355] p-6">
          <div className="bg-gradient-to-br from-[#4A3428] to-[#5D4E37] rounded-xl p-8 border-2 border-[#8B7355] text-center shadow-xl h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5D4E37] to-[#4A3428] rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-[#D4AF37] shadow-lg">
              <span className="text-5xl text-[#D4AF37] font-bold">?</span>
            </div>
            <h3 className="text-[#F4E4BC] font-bold text-xl mb-4">Nenhuma Missão Selecionada</h3>
            <p className="text-[#D4AF37] text-sm mb-6 leading-relaxed">
              Selecione uma missão no mapa ou na lista de missões disponíveis
            </p>
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E6C200] hover:to-[#D4AF37] text-[#2D1B0A] font-bold px-6 py-3 border-2 border-[#F4E4BC] shadow-lg">
              Ver Missões Disponíveis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}