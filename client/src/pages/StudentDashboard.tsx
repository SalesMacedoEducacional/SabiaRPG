import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Star, 
  Trophy, 
  Sword, 
  Map, 
  MessageCircle,
  Bell,
  Plus,
  Minus
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');

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
    <div className="min-h-screen" style={{ backgroundColor: '#3a3a3a' }}>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6" style={{ backgroundColor: '#2a2a2a' }}>
        {/* Logo SABIÁ RPG */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d4af37' }}>
            <Crown className="h-4 w-4 text-black" />
          </div>
          <span className="text-lg font-bold" style={{ color: '#d4af37' }}>SABIÁ RPG</span>
        </div>
        
        {/* Navegação central */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'mapa' ? 'text-white' : 'text-[#b8860b]'
            }`}
            style={activeTab === 'mapa' ? { backgroundColor: '#8b4513' } : {}}
          >
            <Map className="h-4 w-4" />
            Mapa
          </button>
          <button
            onClick={() => setActiveTab('missoes')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'missoes' ? 'text-white' : 'text-[#b8860b]'
            }`}
            style={activeTab === 'missoes' ? { backgroundColor: '#8b4513' } : {}}
          >
            <Sword className="h-4 w-4" />
            Missões
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'ranking' ? 'text-white' : 'text-[#b8860b]'
            }`}
            style={activeTab === 'ranking' ? { backgroundColor: '#8b4513' } : {}}
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'forum' ? 'text-white' : 'text-[#b8860b]'
            }`}
            style={activeTab === 'forum' ? { backgroundColor: '#8b4513' } : {}}
          >
            <MessageCircle className="h-4 w-4" />
            Fórum
          </button>
        </div>
        
        {/* Info do usuário */}
        <div className="flex items-center gap-4 text-sm">
          <div className="relative">
            <Bell className="h-5 w-5" style={{ color: '#b8860b' }} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              1
            </span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Star className="h-4 w-4" style={{ color: '#d4af37' }} />
            <span>{dadosAluno.xp_total} XP</span>
            <span style={{ color: '#b8860b' }}>|</span>
            <span>Nível {dadosAluno.nivel}</span>
          </div>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white text-sm font-bold"
            style={{ backgroundColor: '#8b4513' }}
            onClick={logout}
          >
            AL
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar Esquerda */}
        <div className="w-60 p-4" style={{ backgroundColor: '#2a2a2a' }}>
          {/* Avatar e Info */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold border-2"
                 style={{ backgroundColor: '#8b4513', borderColor: '#d4af37' }}>
              AL
            </div>
            <p className="text-white text-sm mb-1">aluno@sabiarpg.edu.br</p>
            <p style={{ color: '#b8860b', fontSize: '12px' }}>Aprendiz de Sabedoria</p>
          </div>

          {/* Atributos */}
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#d4af37' }}>ATRIBUTOS</h4>
            <div className="space-y-2">
              {[
                'Matemática',
                'Linguagens', 
                'Ciências',
                'História',
                'Geografia',
                'Artes'
              ].map((attr, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-white">{attr}</span>
                  <span style={{ color: '#b8860b' }}>0%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas */}
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#d4af37' }}>CONQUISTAS</h4>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border flex items-center justify-center"
                     style={{ backgroundColor: '#3a3a3a', borderColor: '#8b4513' }}>
                  <span style={{ color: '#666' }}>—</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nível */}
          <div className="rounded p-4" style={{ backgroundColor: '#3a3a3a' }}>
            <div className="text-center mb-3">
              <div className="text-sm font-bold mb-1" style={{ color: '#d4af37' }}>Nível 1</div>
              <div className="text-xs" style={{ color: '#b8860b' }}>0/1000 XP</div>
            </div>
            <div className="text-xs mb-2" style={{ color: '#b8860b' }}>1000 XP para o próximo nível</div>
            <div className="w-full rounded h-2" style={{ backgroundColor: '#2a2a2a' }}>
              <div className="h-2 rounded" style={{ width: '0%', backgroundColor: '#d4af37' }}></div>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'mapa' && (
            <div className="flex-1 flex flex-col">
              {/* Mapa Medieval */}
              <div className="flex-1 p-6">
                <div className="relative h-full rounded-lg overflow-hidden shadow-2xl" 
                     style={{
                       background: `
                         radial-gradient(circle at 20% 30%, #8bc34a 0%, transparent 40%),
                         radial-gradient(circle at 70% 20%, #689f38 0%, transparent 35%),
                         radial-gradient(circle at 40% 70%, #7cb342 0%, transparent 45%),
                         linear-gradient(135deg, #6b8e23 0%, #8bc34a 25%, #689f38 50%, #7cb342 75%, #6b8e23 100%)
                       `
                     }}>
                  
                  {/* Texturas de terreno */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full"
                         style={{
                           backgroundImage: `
                             radial-gradient(circle at 25% 25%, #4a5d23 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, #3e4f1d 1px, transparent 1px)
                           `,
                           backgroundSize: '20px 20px, 30px 30px'
                         }}>
                    </div>
                  </div>

                  {/* Rio serpenteante */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1976d2" stopOpacity="0.9"/>
                        <stop offset="50%" stopColor="#42a5f5" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#64b5f6" stopOpacity="0.9"/>
                      </linearGradient>
                      <filter id="riverShadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#2d1f0f" floodOpacity="0.4"/>
                      </filter>
                    </defs>
                    <path d="M150,350 Q250,280 350,320 Q450,360 550,340 Q650,320 750,360 Q850,400 950,380" 
                          stroke="url(#riverGradient)" strokeWidth="45" fill="none" filter="url(#riverShadow)"/>
                    <path d="M150,350 Q250,280 350,320 Q450,360 550,340 Q650,320 750,360 Q850,400 950,380" 
                          stroke="#87ceeb" strokeWidth="25" fill="none" opacity="0.7"/>
                  </svg>

                  {/* Áreas de terreno variadas */}
                  <div className="absolute top-[60%] left-[70%] w-32 h-24 rounded-full opacity-30"
                       style={{ background: 'radial-gradient(circle, #d2691e 0%, transparent 70%)' }}></div>
                  <div className="absolute top-[20%] right-[20%] w-40 h-32 rounded-full opacity-25"
                       style={{ background: 'radial-gradient(circle, #cd853f 0%, transparent 70%)' }}></div>

                  {/* Construções medievais */}
                  <div className="relative z-10 h-full">
                    
                    {/* Castelo Principal */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-20 h-28 rounded-t-lg shadow-xl flex flex-col items-center justify-center relative"
                             style={{ 
                               backgroundColor: '#8b4513', 
                               border: '2px solid #d4af37',
                               boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                             }}>
                          <Crown className="h-8 w-8 text-yellow-400 mb-2" />
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-8 rounded-t-full bg-red-600 border border-yellow-400"></div>
                          </div>
                          <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-200 rounded"></div>
                          <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-200 rounded"></div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                          <p className="text-xs font-bold px-3 py-1 rounded border text-center whitespace-nowrap"
                             style={{ color: '#d4af37', backgroundColor: '#2d1f0f', borderColor: '#8b4513' }}>
                            CASTELO
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vila da Matemática */}
                    <div className="absolute top-[18%] left-[12%]">
                      <div className="relative">
                        <div className="w-14 h-20 rounded-t-lg shadow-lg flex items-center justify-center"
                             style={{ backgroundColor: '#a0522d', border: '2px solid #cd853f' }}>
                          <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-4 bg-orange-600 rounded-t"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 px-1 py-0.5 rounded" 
                         style={{ color: '#d4af37', backgroundColor: 'rgba(45,31,15,0.8)' }}>
                        Matemática
                      </p>
                    </div>

                    {/* Vila das Linguagens */}
                    <div className="absolute top-[25%] left-[35%]">
                      <div className="relative">
                        <div className="w-14 h-20 rounded-t-lg shadow-lg flex items-center justify-center"
                             style={{ backgroundColor: '#a0522d', border: '2px solid #cd853f' }}>
                          <span className="text-white font-bold text-lg">L</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-4 bg-blue-600 rounded-t"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 px-1 py-0.5 rounded" 
                         style={{ color: '#d4af37', backgroundColor: 'rgba(45,31,15,0.8)' }}>
                        Linguagens
                      </p>
                    </div>

                    {/* Torre das Ciências */}
                    <div className="absolute top-[20%] right-[12%]">
                      <div className="relative">
                        <div className="w-14 h-20 rounded-t-lg shadow-lg flex items-center justify-center"
                             style={{ backgroundColor: '#a0522d', border: '2px solid #cd853f' }}>
                          <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-4 bg-purple-600 rounded-t"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 px-1 py-0.5 rounded" 
                         style={{ color: '#d4af37', backgroundColor: 'rgba(45,31,15,0.8)' }}>
                        Ciências
                      </p>
                    </div>

                    {/* Biblioteca da História */}
                    <div className="absolute bottom-[25%] left-[15%]">
                      <div className="relative">
                        <div className="w-14 h-20 rounded-t-lg shadow-lg flex items-center justify-center"
                             style={{ backgroundColor: '#a0522d', border: '2px solid #cd853f' }}>
                          <span className="text-white font-bold text-lg">H</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-4 bg-red-600 rounded-t"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 px-1 py-0.5 rounded" 
                         style={{ color: '#d4af37', backgroundColor: 'rgba(45,31,15,0.8)' }}>
                        História
                      </p>
                    </div>

                    {/* Observatório da Geografia */}
                    <div className="absolute bottom-[20%] right-[15%]">
                      <div className="relative">
                        <div className="w-14 h-20 rounded-t-lg shadow-lg flex items-center justify-center"
                             style={{ backgroundColor: '#a0522d', border: '2px solid #cd853f' }}>
                          <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-4 bg-green-600 rounded-t"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 px-1 py-0.5 rounded" 
                         style={{ color: '#d4af37', backgroundColor: 'rgba(45,31,15,0.8)' }}>
                        Geografia
                      </p>
                    </div>

                    {/* Ateliê das Artes */}
                    <div className="absolute top-[45%] left-[8%]">
                      <div className="relative">
                        <div className="w-14 h-20 rounded-t-lg shadow-lg flex items-center justify-center"
                             style={{ backgroundColor: '#a0522d', border: '2px solid #cd853f' }}>
                          <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-4 bg-pink-600 rounded-t"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 px-1 py-0.5 rounded" 
                         style={{ color: '#d4af37', backgroundColor: 'rgba(45,31,15,0.8)' }}>
                        Artes
                      </p>
                    </div>

                    {/* Construções menores espalhadas */}
                    {[
                      { top: '30%', left: '28%', color: '#8b4513' },
                      { top: '35%', right: '28%', color: '#a0522d' },
                      { bottom: '35%', left: '42%', color: '#8b4513' },
                      { bottom: '30%', right: '35%', color: '#a0522d' },
                      { top: '50%', left: '62%', color: '#8b4513' },
                      { top: '40%', right: '25%', color: '#a0522d' },
                      { bottom: '40%', left: '25%', color: '#8b4513' },
                      { top: '25%', left: '55%', color: '#a0522d' },
                      { top: '60%', left: '45%', color: '#8b4513' },
                      { bottom: '50%', right: '45%', color: '#a0522d' }
                    ].map((pos, i) => (
                      <div key={i} className="absolute" style={pos}>
                        <div className="w-10 h-16 rounded-t-md shadow-md"
                             style={{ backgroundColor: pos.color, border: '1px solid #cd853f' }}>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controles de zoom */}
                  <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <button className="w-10 h-10 rounded border-2 flex items-center justify-center text-white hover:bg-opacity-80 transition-all"
                            style={{ backgroundColor: '#3d2f1f', borderColor: '#8b4513' }}>
                      <Plus className="h-5 w-5" />
                    </button>
                    <button className="w-10 h-10 rounded border-2 flex items-center justify-center text-white hover:bg-opacity-80 transition-all"
                            style={{ backgroundColor: '#3d2f1f', borderColor: '#8b4513' }}>
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Seção de Missões */}
              <div className="p-6" style={{ backgroundColor: '#2a2a2a' }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: '#d4af37' }}>MISSÕES</h2>
                  <Button className="text-white text-sm px-6 py-2 rounded hover:bg-opacity-80 transition-all"
                          style={{ backgroundColor: '#8b4513' }}>
                    Ver Todas
                  </Button>
                </div>

                <div className="flex gap-3 mb-6">
                  <button className="px-6 py-2 rounded text-sm font-medium text-white"
                          style={{ backgroundColor: '#8b4513' }}>
                    Ativas (0)
                  </button>
                  <button className="px-6 py-2 rounded text-sm font-medium hover:bg-opacity-80 transition-all"
                          style={{ color: '#b8860b', backgroundColor: '#3a3a3a' }}>
                    Disponíveis (0)
                  </button>
                  <button className="px-6 py-2 rounded text-sm font-medium hover:bg-opacity-80 transition-all"
                          style={{ color: '#b8860b', backgroundColor: '#3a3a3a' }}>
                    Concluídas (0)
                  </button>
                </div>

                <div className="text-center py-12 rounded border"
                     style={{ backgroundColor: '#3a3a3a', borderColor: '#8b4513' }}>
                  <p className="text-white font-medium text-lg">Nenhuma missão ativa</p>
                  <p className="text-sm mt-2" style={{ color: '#b8860b' }}>
                    Inicie uma nova missão disponível para continuar sua jornada
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Outras abas */}
          {activeTab !== 'mapa' && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: '#3a3a3a' }}>
                  {activeTab === 'missoes' && <Sword className="h-10 w-10" style={{ color: '#d4af37' }} />}
                  {activeTab === 'ranking' && <Trophy className="h-10 w-10" style={{ color: '#d4af37' }} />}
                  {activeTab === 'forum' && <MessageCircle className="h-10 w-10" style={{ color: '#d4af37' }} />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {activeTab === 'missoes' && 'Missões'}
                  {activeTab === 'ranking' && 'Ranking'}
                  {activeTab === 'forum' && 'Fórum'}
                </h2>
                <p style={{ color: '#b8860b' }}>Em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Direita */}
        <div className="w-80 p-6" style={{ backgroundColor: '#2a2a2a' }}>
          <div className="rounded-lg p-8 text-center h-full flex flex-col items-center justify-center border"
               style={{ backgroundColor: '#3a3a3a', borderColor: '#8b4513' }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2"
                 style={{ backgroundColor: '#2a2a2a', borderColor: '#8b4513' }}>
              <span className="text-4xl" style={{ color: '#8b4513' }}>?</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Nenhuma Missão</h3>
            <h3 className="text-white font-bold text-xl mb-6">Selecionada</h3>
            <p className="text-sm mb-8 leading-relaxed max-w-xs" style={{ color: '#b8860b' }}>
              Selecione uma missão no mapa ou na lista de missões disponíveis
            </p>
            <Button className="text-white text-sm px-6 py-3 rounded hover:bg-opacity-80 transition-all"
                    style={{ backgroundColor: '#8b4513' }}>
              Ver Missões Disponíveis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}