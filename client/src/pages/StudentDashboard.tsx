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
  Bell,
  Plus,
  Minus
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
    <div className="min-h-screen" style={{ backgroundColor: '#3A2F2A' }}>
      {/* Header exato da imagem de referência */}
      <header className="h-16" style={{ backgroundColor: '#2D1B0A' }}>
        <div className="flex justify-between items-center h-full px-6">
          {/* Logo SABIÁ RPG - Exato da imagem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4AF37' }}>
              <Crown className="h-5 w-5" style={{ color: '#2D1B0A' }} />
            </div>
            <span className="text-xl font-bold tracking-wide" style={{ color: '#D4AF37' }}>SABIÁ RPG</span>
          </div>
          
          {/* Navegação central - Exata da imagem */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'mapa'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={activeTab === 'mapa' ? { backgroundColor: '#8B4513' } : {}}
            >
              <Map className="h-4 w-4" />
              Mapa
            </button>
            <button
              onClick={() => setActiveTab('missoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'missoes'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={activeTab === 'missoes' ? { backgroundColor: '#8B4513' } : {}}
            >
              <Sword className="h-4 w-4" />
              Missões
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'ranking'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={activeTab === 'ranking' ? { backgroundColor: '#8B4513' } : {}}
            >
              <Trophy className="h-4 w-4" />
              Ranking
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === 'forum'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={activeTab === 'forum' ? { backgroundColor: '#8B4513' } : {}}
            >
              <MessageCircle className="h-4 w-4" />
              Fórum
            </button>
          </div>
          
          {/* Info do usuário - Exata da imagem */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                1
              </span>
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <Star className="h-4 w-4" style={{ color: '#D4AF37' }} />
              <span className="font-medium">{dadosAluno.xp_total} XP</span>
              <span className="text-gray-400">|</span>
              <span className="font-medium">Nível {dadosAluno.nivel}</span>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                 style={{ backgroundColor: '#8B4513' }}
                 onClick={logout}>
              <span className="text-white text-sm font-bold">
                AL
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar Esquerda - Exata da imagem */}
        <div className="w-80 p-6 overflow-y-auto" style={{ backgroundColor: '#2D1B0A' }}>
          {/* Avatar e Info Principal */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                 style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
              <span className="text-2xl font-bold text-white">AL</span>
            </div>
            <p className="text-white text-sm font-medium mb-1">aluno@sabiarpg.edu.br</p>
            <p className="text-gray-400 text-xs">Aprendiz de Sabedoria</p>
          </div>

          {/* Atributos - Exato da imagem */}
          <div className="mb-8">
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide" style={{ color: '#D4AF37' }}>ATRIBUTOS</h4>
            <div className="space-y-3">
              {[
                { nome: 'Matemática', progresso: 0 },
                { nome: 'Linguagens', progresso: 0 },
                { nome: 'Ciências', progresso: 0 },
                { nome: 'História', progresso: 0 },
                { nome: 'Geografia', progresso: 0 },
                { nome: 'Artes', progresso: 0 }
              ].map((attr, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-white">{attr.nome}</span>
                  <span className="text-gray-400">{attr.progresso}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas - Exato da imagem */}
          <div className="mb-8">
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide" style={{ color: '#D4AF37' }}>CONQUISTAS</h4>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                     style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}>
                  <span className="text-gray-500 text-lg">—</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nível - Exato da imagem */}
          <div className="rounded-lg p-6 border"
               style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}>
            <div className="text-center mb-3">
              <div className="text-sm font-bold mb-1" style={{ color: '#D4AF37' }}>Nível 1</div>
              <div className="text-xs text-gray-400">0/1000 XP</div>
            </div>
            <div className="text-xs text-gray-400 mb-2">1000 XP para o próximo nível</div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: '#2D1B0A' }}>
              <div className="h-2 rounded-full" style={{ width: '0%', backgroundColor: '#D4AF37' }}></div>
            </div>
          </div>
        </div>

        {/* Área Principal - Mapa exato da imagem */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'mapa' && (
            <div className="flex-1 flex flex-col">
              {/* Mapa Medieval - Background e elementos exatos da imagem */}
              <div className="flex-1 p-6">
                <div className="relative h-full rounded-lg overflow-hidden" 
                     style={{
                       background: 'linear-gradient(135deg, #8FBC8F 0%, #9ACD32 25%, #228B22 50%, #6B8E23 75%, #8FBC8F 100%)'
                     }}>
                  
                  {/* Rio azul serpenteante - Exato da imagem */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                    <path d="M150,400 Q250,320 350,360 Q450,400 550,380 Q650,360 750,400 Q850,440 950,420" 
                          stroke="#4682B4" strokeWidth="50" fill="none" opacity="0.9"/>
                    <path d="M150,400 Q250,320 350,360 Q450,400 550,380 Q650,360 750,400 Q850,440 950,420" 
                          stroke="#87CEEB" strokeWidth="30" fill="none" opacity="0.8"/>
                  </svg>

                  {/* Construções medievais - Posições exatas da imagem */}
                  <div className="relative z-10 h-full p-8">
                    
                    {/* Castelo Principal - Centro do mapa */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-32 rounded-t-lg border-2 shadow-lg"
                             style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                          <div className="flex justify-center mt-3">
                            <Crown className="h-10 w-10" style={{ color: '#FFD700' }} />
                          </div>
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-8 rounded-t-full" style={{ backgroundColor: '#DC143C' }}></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                          <p className="text-center font-bold text-sm px-3 py-1 rounded border"
                             style={{ color: '#D4AF37', backgroundColor: '#2D1B0A', borderColor: '#8B4513' }}>
                            CASTELO
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vilas e construções espalhadas - Posições da imagem */}
                    
                    {/* Área Superior Esquerda */}
                    <div className="absolute top-[15%] left-[12%]">
                      <div className="w-16 h-20 rounded-t-lg border shadow-md"
                           style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                        <div className="text-center mt-2">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                      </div>
                      <p className="text-center text-xs mt-1" style={{ color: '#D4AF37' }}>Matemática</p>
                    </div>

                    {/* Área Superior Central */}
                    <div className="absolute top-[10%] left-[35%]">
                      <div className="w-16 h-20 rounded-t-lg border shadow-md"
                           style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                        <div className="text-center mt-2">
                          <span className="text-white font-bold text-sm">L</span>
                        </div>
                      </div>
                      <p className="text-center text-xs mt-1" style={{ color: '#D4AF37' }}>Linguagens</p>
                    </div>

                    {/* Área Superior Direita */}
                    <div className="absolute top-[18%] right-[12%]">
                      <div className="w-16 h-20 rounded-t-lg border shadow-md"
                           style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                        <div className="text-center mt-2">
                          <span className="text-white font-bold text-sm">C</span>
                        </div>
                      </div>
                      <p className="text-center text-xs mt-1" style={{ color: '#D4AF37' }}>Ciências</p>
                    </div>

                    {/* Área Inferior Esquerda */}
                    <div className="absolute bottom-[20%] left-[15%]">
                      <div className="w-16 h-20 rounded-t-lg border shadow-md"
                           style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                        <div className="text-center mt-2">
                          <span className="text-white font-bold text-sm">H</span>
                        </div>
                      </div>
                      <p className="text-center text-xs mt-1" style={{ color: '#D4AF37' }}>História</p>
                    </div>

                    {/* Área Inferior Direita */}
                    <div className="absolute bottom-[15%] right-[18%]">
                      <div className="w-16 h-20 rounded-t-lg border shadow-md"
                           style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                        <div className="text-center mt-2">
                          <span className="text-white font-bold text-sm">G</span>
                        </div>
                      </div>
                      <p className="text-center text-xs mt-1" style={{ color: '#D4AF37' }}>Geografia</p>
                    </div>

                    {/* Área Esquerda */}
                    <div className="absolute top-[45%] left-[8%]">
                      <div className="w-16 h-20 rounded-t-lg border shadow-md"
                           style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                        <div className="text-center mt-2">
                          <span className="text-white font-bold text-sm">A</span>
                        </div>
                      </div>
                      <p className="text-center text-xs mt-1" style={{ color: '#D4AF37' }}>Artes</p>
                    </div>

                    {/* Construções menores espalhadas */}
                    {[
                      { top: '25%', left: '28%' },
                      { top: '32%', right: '25%' },
                      { bottom: '35%', left: '45%' },
                      { bottom: '28%', right: '40%' },
                      { top: '55%', left: '65%' },
                      { top: '38%', right: '35%' },
                      { bottom: '45%', left: '25%' },
                      { top: '28%', left: '55%' }
                    ].map((pos, i) => (
                      <div key={i} className="absolute" style={pos}>
                        <div className="w-12 h-16 rounded-t-md border shadow-sm"
                             style={{ backgroundColor: '#8B4513', borderColor: '#A0522D' }}>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controles de zoom - Exatos da imagem */}
                  <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <button className="w-10 h-10 rounded border flex items-center justify-center text-white transition-colors"
                            style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3F3A'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3A2F2A'}>
                      <Plus className="h-5 w-5" />
                    </button>
                    <button className="w-10 h-10 rounded border flex items-center justify-center text-white transition-colors"
                            style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3F3A'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3A2F2A'}>
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Seção de Missões - Exata da imagem */}
              <div className="p-6 border-t"
                   style={{ backgroundColor: '#2D1B0A', borderColor: '#8B4513' }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#D4AF37' }}>Missões</h2>
                  <Button className="text-white text-sm px-6 py-2 rounded border transition-colors"
                          style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#A0522D'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#8B4513'}>
                    Ver Todas
                  </Button>
                </div>

                <div className="flex gap-3 mb-6">
                  <button className="px-6 py-2 rounded text-sm font-medium border text-white"
                          style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}>
                    Ativas (0)
                  </button>
                  <button className="px-6 py-2 rounded text-sm font-medium border text-gray-400 transition-colors"
                          style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}
                          onMouseEnter={(e) => { e.target.style.backgroundColor = '#4A3F3A'; e.target.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.target.style.backgroundColor = '#3A2F2A'; e.target.style.color = '#9CA3AF'; }}>
                    Disponíveis (0)
                  </button>
                  <button className="px-6 py-2 rounded text-sm font-medium border text-gray-400 transition-colors"
                          style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}
                          onMouseEnter={(e) => { e.target.style.backgroundColor = '#4A3F3A'; e.target.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.target.style.backgroundColor = '#3A2F2A'; e.target.style.color = '#9CA3AF'; }}>
                    Concluídas (0)
                  </button>
                </div>

                <div className="text-center py-12 rounded border"
                     style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}>
                  <p className="text-white font-medium text-lg">Nenhuma missão ativa</p>
                  <p className="text-gray-400 text-sm mt-2">Inicie uma nova missão disponível para continuar sua jornada</p>
                </div>
              </div>
            </div>
          )}

          {/* Outras abas com mesmo estilo */}
          {activeTab !== 'mapa' && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: '#3A2F2A' }}>
                  {activeTab === 'missoes' && <Sword className="h-10 w-10" style={{ color: '#D4AF37' }} />}
                  {activeTab === 'ranking' && <Trophy className="h-10 w-10" style={{ color: '#D4AF37' }} />}
                  {activeTab === 'forum' && <MessageCircle className="h-10 w-10" style={{ color: '#D4AF37' }} />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {activeTab === 'missoes' && 'Missões'}
                  {activeTab === 'ranking' && 'Ranking'}
                  {activeTab === 'forum' && 'Fórum'}
                </h2>
                <p className="text-gray-400">Em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Direita - Exata da imagem */}
        <div className="w-80 p-6 border-l"
             style={{ backgroundColor: '#2D1B0A', borderColor: '#8B4513' }}>
          <div className="rounded-lg p-8 border text-center h-full flex flex-col items-center justify-center"
               style={{ backgroundColor: '#3A2F2A', borderColor: '#8B4513' }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2"
                 style={{ backgroundColor: '#2D1B0A', borderColor: '#8B4513' }}>
              <span className="text-4xl" style={{ color: '#8B4513' }}>?</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-1">Nenhuma Missão</h3>
            <h3 className="text-white font-bold text-xl mb-6">Selecionada</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs">
              Selecione uma missão no mapa ou na lista de missões disponíveis
            </p>
            <Button className="text-white text-sm px-6 py-3 rounded border transition-colors"
                    style={{ backgroundColor: '#8B4513', borderColor: '#D4AF37' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#A0522D'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#8B4513'}>
              Ver Missões Disponíveis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}