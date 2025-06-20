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

  // Dados padrão enquanto não carrega da API
  const dadosAluno = {
    nome: (studentData as any)?.nome || user?.nome || 'Aluno Teste',
    email: (studentData as any)?.email || user?.email || 'aluno@sabiarpg.edu.br',
    xp_total: (studentData as any)?.xp_total || 0,
    nivel: (studentData as any)?.nivel || 1
  };

  // Componentes curriculares com progresso
  const componentesCurriculares = [
    { nome: 'Matemática', progresso: 0, cor: '#2563EB', local: 'VILA DA MATEMÁTICA' },
    { nome: 'Linguagens', progresso: 0, cor: '#16A34A', local: 'VILA DAS LINGUAGENS' },
    { nome: 'Ciências', progresso: 0, cor: '#9333EA', local: 'TORRE DAS CIÊNCIAS' },
    { nome: 'História', progresso: 0, cor: '#DC2626', local: 'BIBLIOTECA' },
    { nome: 'Geografia', progresso: 0, cor: '#EA580C', local: 'OBSERVATÓRIO' },
    { nome: 'Artes', progresso: 0, cor: '#C2410C', local: 'ATELIÊ' }
  ];

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
            <span className="text-[#F4E4BC] text-sm">★ {dadosAluno.xp_total}XP | Nível {dadosAluno.nivel}</span>
            <div className="w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center border-2 border-[#F4E4BC] cursor-pointer"
                 onClick={logout}>
              <span className="text-[#2D1B0A] text-sm font-bold">
                {dadosAluno.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AL'}
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
                {dadosAluno.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AL'}
              </span>
            </div>
            <p className="text-[#D4AF37] text-sm mb-1">{dadosAluno.email}</p>
            <p className="text-[#F4E4BC] text-xs">Aprendiz de Sabedoria</p>
          </div>

          {/* Atributos por Componente */}
          <div className="mb-6">
            <h4 className="text-[#F4E4BC] font-bold mb-3 text-sm">ATRIBUTOS</h4>
            <div className="space-y-3">
              {componentesCurriculares.map((componente, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-[#F4E4BC] text-xs">{componente.nome}</span>
                  <span className="text-[#D4AF37] text-xs">{componente.progresso}%</span>
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
                <div className="relative h-full min-h-[500px] rounded-lg overflow-hidden" 
                     style={{
                       background: 'linear-gradient(45deg, #8B7D6B 0%, #A0916F 20%, #7A9B76 40%, #6B8E6B 60%, #A0916F 80%, #8B7D6B 100%)'
                     }}>
                  
                  {/* Rio serpenteante */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <path d="M0,300 Q200,200 400,300 Q600,400 800,300" 
                          stroke="#4A90E2" strokeWidth="40" fill="none" opacity="0.7"/>
                  </svg>

                  {/* Montanhas de fundo */}
                  <div className="absolute top-0 left-0 w-full h-1/3 opacity-30">
                    <svg viewBox="0 0 800 200" className="w-full h-full">
                      <polygon points="0,200 100,50 200,200" fill="#5D4037" opacity="0.6"/>
                      <polygon points="150,200 250,30 350,200" fill="#4E342E" opacity="0.7"/>
                      <polygon points="300,200 400,60 500,200" fill="#5D4037" opacity="0.5"/>
                      <polygon points="450,200 550,40 650,200" fill="#4E342E" opacity="0.6"/>
                      <polygon points="600,200 700,70 800,200" fill="#5D4037" opacity="0.7"/>
                    </svg>
                  </div>

                  {/* Locais específicos do mapa medieval */}
                  <div className="relative z-10 h-full p-8">
                    
                    {/* Fortaleza Principal - Centro-esquerda */}
                    <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-24 h-28 bg-[#8B4513] border-4 border-[#654321] rounded-t-lg">
                          <div className="w-full h-4 bg-[#654321] mt-2"></div>
                          <div className="flex justify-center mt-2">
                            <Crown className="h-8 w-8 text-[#FFD700]" />
                          </div>
                        </div>
                        <p className="text-center text-[#F4E4BC] font-bold text-xs mt-1 bg-black/50 px-2 py-1 rounded">CASTELO</p>
                      </div>
                    </div>

                    {/* Vila da Matemática - Norte */}
                    <div className="absolute top-[15%] left-[20%]">
                      <div className="relative">
                        <div className="w-12 h-12 bg-[#8B4513] rounded-lg border-2 border-[#654321] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">M</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">VILA DA MATEMÁTICA</p>
                      </div>
                    </div>

                    {/* Vila das Linguagens - Nordeste */}
                    <div className="absolute top-[20%] right-[25%]">
                      <div className="relative">
                        <div className="w-12 h-12 bg-[#8B4513] rounded-lg border-2 border-[#654321] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">L</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">VILA DAS LINGUAGENS</p>
                      </div>
                    </div>

                    {/* Torre das Ciências - Leste */}
                    <div className="absolute top-[35%] right-[15%]">
                      <div className="relative">
                        <div className="w-8 h-16 bg-[#4A90E2] rounded-t-full border-2 border-[#2171B5] flex items-end justify-center pb-1">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">TORRE DAS CIÊNCIAS</p>
                      </div>
                    </div>

                    {/* Biblioteca da História - Sul */}
                    <div className="absolute bottom-[25%] left-[30%]">
                      <div className="relative">
                        <div className="w-14 h-10 bg-[#8B4513] border-2 border-[#654321] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">H</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">BIBLIOTECA</p>
                      </div>
                    </div>

                    {/* Observatório da Geografia - Sudeste */}
                    <div className="absolute bottom-[30%] right-[20%]">
                      <div className="relative">
                        <div className="w-10 h-10 bg-[#228B22] rounded-full border-2 border-[#006400] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">OBSERVATÓRIO</p>
                      </div>
                    </div>

                    {/* Ateliê das Artes - Oeste */}
                    <div className="absolute top-[45%] left-[10%]">
                      <div className="relative">
                        <div className="w-12 h-12 bg-[#9C27B0] rounded-lg border-2 border-[#6A1B9A] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">ATELIÊ</p>
                      </div>
                    </div>

                    {/* Porto - Sul do rio */}
                    <div className="absolute bottom-[20%] left-[60%]">
                      <div className="relative">
                        <div className="w-16 h-8 bg-[#8B4513] border-2 border-[#654321] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">PORTO</span>
                        </div>
                      </div>
                    </div>

                    {/* Bosque Encantado - Sudoeste */}
                    <div className="absolute bottom-[15%] left-[15%]">
                      <div className="flex space-x-1">
                        <div className="w-3 h-6 bg-[#228B22] rounded-t-full"></div>
                        <div className="w-4 h-8 bg-[#32CD32] rounded-t-full"></div>
                        <div className="w-3 h-5 bg-[#228B22] rounded-t-full"></div>
                      </div>
                      <p className="text-center text-[#F4E4BC] text-xs mt-1 bg-black/50 px-1 rounded">BOSQUE</p>
                    </div>

                  </div>

                  {/* Controles de zoom */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button className="w-8 h-8 bg-[#5D3F26] border border-[#B8860B] rounded flex items-center justify-center text-[#F4E4BC] hover:bg-[#6B4A32]">
                      +
                    </button>
                    <button className="w-8 h-8 bg-[#5D3F26] border border-[#B8860B] rounded flex items-center justify-center text-[#F4E4BC] hover:bg-[#6B4A32]">
                      −
                    </button>
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