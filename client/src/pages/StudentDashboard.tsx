import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Crown, 
  Star, 
  Trophy, 
  Sword, 
  Map, 
  MessageCircle,
  Bell,
  Plus,
  Minus,
  User,
  LogOut,
  Settings,
  X,
  Info
} from 'lucide-react';
import mapaImg from '@assets/mapa_1750435067177.png';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');
  const [selectedCity, setSelectedCity] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showKingdomInfo, setShowKingdomInfo] = useState(false);

  // Query dos dados do aluno
  const { data: studentData = {}, isLoading: studentLoading } = useQuery({
    queryKey: ['/api/aluno/dados'],
    enabled: !!user?.id
  });

  // Dados padrão para exibição
  const dadosAluno = {
    nome: (studentData as any)?.nome || user?.nome || 'Aluno Teste',
    email: (studentData as any)?.email || user?.email || 'aluno@sabiarpg.edu.br',
    xp_total: (studentData as any)?.xp_total || 0,
    nivel: (studentData as any)?.nivel || 1
  };

  // Dados das cidades do Piauí
  const cidades = {
    teresina: {
      nome: "Teresina – A Cidade das Duas Correntes",
      descricao: "Fortaleza Arcanomural: As muralhas de pedra negra são cravadas de runas que se acendem à noite, alimentadas pelo cristal pulsante no centro.",
      caracteristicas: [
        "Esfera do Conclave: O cristal mágico emite um brilho prateado que flutua acima da praça central, conferindo proteção contra ataques de criaturas sombrias.",
        "Legião dos Vigias Azuis: Guardiões encapuzados patrulham torres gêmeas, montados em grifos menores.",
        "Rios Viventes: As fitas azuis formam o 'Caminho de Lamen', correntes encantadas que conduzem viajantes místicos até portais submersos.",
        "Mercadores de Pergaminhos: Ao longo dos fossos, tendas vendem mapas de tesouros e poções de visão aquática."
      ]
    },
    parnaiba: {
      nome: "Parnaíba – O Portal dos Ventos",
      descricao: "Porto místico onde navios voadores atracam. O farol de cristal azul guia embarcações aéreas através das nuvens encantadas.",
      caracteristicas: [
        "Torre dos Ventos: Farol que emite raios azuis para orientar navios voadores",
        "Mercado Flutuante: Plataformas suspensas onde comerciantes vendem artefatos mágicos",
        "Guildas Náuticas: Navegadores especializados em rotas aéreas e marítimas",
        "Santuário das Correntes: Local sagrado onde as águas terrestres encontram os ventos celestiais"
      ]
    },
    picos: {
      nome: "Picos – A Feira do Crepúsculo",
      descricao: "Centro comercial do reino onde mercadores de todas as terras se reúnem. Famosa por seus mercados noturnos iluminados por cristais multicoloridos.",
      caracteristicas: [
        "Mercado das Mil Luzes: Cristais coloridos iluminam as bancas durante a noite",
        "Guilda dos Comerciantes: Organização que regula o comércio entre reinos",
        "Arena dos Negócios: Local onde contratos importantes são selados",
        "Taverna do Viajante: Ponto de encontro de aventureiros e mercadores"
      ]
    },
    floriano: {
      nome: "Floriano – A Ponte dos Destinos",
      descricao: "Cidade construída sobre uma ponte mágica que conecta duas dimensões. Conhecida pelos oráculos que preveem o futuro dos viajantes.",
      caracteristicas: [
        "Ponte Dimensional: Estrutura que liga dois planos de existência",
        "Círculo dos Oráculos: Videntes que leem o destino nas águas correntes",
        "Biblioteca Temporal: Contém registros do passado e futuro",
        "Mercado de Amuletos: Venda de talismãs de proteção e sorte"
      ]
    },
    campo_maior: {
      nome: "Campo Maior – As Planícies Douradas",
      descricao: "Vastas planícies onde crescem as plantas mágicas mais raras. Centro de estudos de alquimia e botânica mística.",
      caracteristicas: [
        "Jardins Alquímicos: Plantações de ervas com propriedades mágicas",
        "Torre dos Elementos: Centro de estudos de transmutação",
        "Laboratórios Secretos: Onde alquimistas desenvolvem poções raras",
        "Festival das Colheitas: Celebração anual dos frutos mágicos"
      ]
    },
    oeiras: {
      nome: "Oeiras – O Enclave Barroco",
      descricao: "Cidade de arquitetura elaborada onde residem os nobres e artistas. Conhecida por suas torres ornamentadas e jardins suspensos.",
      caracteristicas: [
        "Palácio das Artes: Residência dos mestres artistas do reino",
        "Jardins Suspensos: Terraços mágicos que flutuam no ar",
        "Academia Real: Centro de ensino para jovens nobres",
        "Galeria dos Mestres: Exposição de obras de arte encantadas"
      ]
    },
    bom_jesus: {
      nome: "Bom Jesus – Os Morros da Fé",
      descricao: "Cidade sagrada construída nas montanhas. Local de peregrinação onde monges guardam conhecimentos ancestrais.",
      caracteristicas: [
        "Mosteiro da Luz Eterna: Templo principal dos monges guardiões",
        "Biblioteca Sagrada: Contém textos místicos e profecias antigas",
        "Trilha dos Peregrinos: Caminho de purificação espiritual",
        "Santuário da Cura: Local onde milagres de cura acontecem"
      ]
    }
  };

  const atributos = [
    { nome: 'Matemática', progresso: 0, cor: '#ff6b35' },
    { nome: 'Linguagens', progresso: 0, cor: '#f7931e' },
    { nome: 'Ciências', progresso: 0, cor: '#1e90ff' },
    { nome: 'História', progresso: 0, cor: '#dc143c' },
    { nome: 'Geografia', progresso: 0, cor: '#32cd32' },
    { nome: 'Artes', progresso: 0, cor: '#9370db' }
  ];

  if (studentLoading) {
    return (
      <div className="min-h-screen bg-[#3a3a3a] flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-12 w-12 text-[#d4af37] mx-auto mb-4 animate-spin" />
          <p className="text-white text-lg">Carregando seu reino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3a3a3a]">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[#8b4513]" 
              style={{ backgroundColor: '#2a2a2a' }}>
        {/* Logo SABIÁ RPG */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: '#d4af37' }}>
            <Crown className="h-4 w-4 text-black" />
          </div>
          <span className="text-lg font-bold text-[#d4af37]">SABIÁ RPG</span>
        </div>
        
        {/* Navegação central */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'mapa' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('mapa')}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium"
            style={activeTab === 'mapa' ? { backgroundColor: '#8b4513', color: 'white' } : { color: '#b8860b' }}
          >
            <Map className="h-4 w-4" />
            Mapa
          </Button>
          <Button
            variant={activeTab === 'missoes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('missoes')}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium"
            style={activeTab === 'missoes' ? { backgroundColor: '#8b4513', color: 'white' } : { color: '#b8860b' }}
          >
            <Sword className="h-4 w-4" />
            Missões
          </Button>
          <Button
            variant={activeTab === 'ranking' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ranking')}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium"
            style={activeTab === 'ranking' ? { backgroundColor: '#8b4513', color: 'white' } : { color: '#b8860b' }}
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </Button>
          <Button
            variant={activeTab === 'forum' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('forum')}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium"
            style={activeTab === 'forum' ? { backgroundColor: '#8b4513', color: 'white' } : { color: '#b8860b' }}
          >
            <MessageCircle className="h-4 w-4" />
            Fórum
          </Button>
        </div>
        
        {/* Info do usuário com dropdown */}
        <div className="flex items-center gap-4 text-sm">
          <div className="relative">
            <Bell className="h-5 w-5 text-[#b8860b]" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              3
            </span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Star className="h-4 w-4 text-[#d4af37]" />
            <span>{dadosAluno.xp_total} XP</span>
            <span className="text-[#b8860b]">|</span>
            <span>Nível {dadosAluno.nivel}</span>
          </div>
          
          {/* Dropdown do perfil */}
          <div className="relative">
            <Button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-[#d4af37]"
              style={{ backgroundColor: '#8b4513' }}
            >
              AL
            </Button>
            
            {showProfile && (
              <div className="absolute right-0 top-10 w-48 rounded border shadow-lg z-50"
                   style={{ backgroundColor: '#2a2a2a', borderColor: '#8b4513' }}>
                <div className="p-3 border-b border-[#8b4513]">
                  <p className="text-white text-sm font-medium">Minha conta</p>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-white hover:bg-[#3a3a3a]"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full justify-start text-left text-white hover:bg-[#3a3a3a]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar Esquerda */}
        <div className="w-60 p-4 border-r border-[#8b4513]" style={{ backgroundColor: '#2a2a2a' }}>
          {/* Avatar e Info */}
          <div className="text-center mb-6">
            <div className="relative mx-auto mb-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-2"
                   style={{ backgroundColor: '#8b4513', borderColor: '#d4af37' }}>
                AL
              </div>
              <div className="absolute -top-2 -right-2 bg-[#d4af37] text-black text-xs px-2 py-1 rounded-full font-bold">
                Nv. 1
              </div>
            </div>
            <p className="text-white text-sm mb-1">aluno@sabiarpg.edu.br</p>
            <p className="text-[#b8860b] text-xs">Aprendiz de Sabedoria</p>
          </div>

          {/* Atributos com cores dos componentes */}
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide text-[#d4af37]">ATRIBUTOS</h4>
            <div className="space-y-3">
              {atributos.map((attr, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white">{attr.nome}</span>
                    <span className="text-[#b8860b]">{attr.progresso}%</span>
                  </div>
                  <div className="w-full bg-[#3a3a3a] rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${attr.progresso}%`, 
                        backgroundColor: attr.cor 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conquistas */}
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide text-[#d4af37]">CONQUISTAS</h4>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="w-8 h-8 rounded border flex items-center justify-center bg-[#3a3a3a] border-[#8b4513]">
                  <span className="text-gray-600 text-xs">???</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nível */}
          <div className="rounded p-4 border border-[#8b4513]" style={{ backgroundColor: '#3a3a3a' }}>
            <div className="text-center mb-3">
              <div className="text-sm font-bold mb-1 text-[#d4af37]">Nível 1</div>
              <div className="text-xs text-[#b8860b]">0/1000 XP</div>
            </div>
            <div className="text-xs mb-2 text-[#b8860b]">1000 XP para o próximo nível</div>
            <div className="w-full rounded h-2 bg-[#2a2a2a]">
              <div className="h-2 rounded bg-[#d4af37]" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'mapa' && (
            <div className="flex-1 flex flex-col">
              {/* Botão de informações do reino */}
              <div className="p-4 border-b border-[#8b4513]" style={{ backgroundColor: '#2a2a2a' }}>
                <Button
                  onClick={() => setShowKingdomInfo(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-[#8b4513] text-white hover:bg-[#a0522d]"
                >
                  <Info className="h-4 w-4" />
                  Reino Educacional do Piauí
                </Button>
              </div>

              {/* Mapa */}
              <div className="flex-1 p-6">
                <div className="relative h-full rounded-lg overflow-hidden shadow-2xl border-2 border-[#8b4513]">
                  <img 
                    src={mapaImg} 
                    alt="Reino Educacional do Piauí"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Cidades clicáveis */}
                  <div className="absolute inset-0">
                    {/* Teresina */}
                    <button
                      onClick={() => setSelectedCity('teresina')}
                      className="absolute top-[45%] left-[50%] w-8 h-8 rounded-full bg-[#d4af37] border-2 border-white transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform shadow-lg"
                      title="Teresina"
                    >
                      <Crown className="h-4 w-4 mx-auto text-black" />
                    </button>

                    {/* Parnaíba */}
                    <button
                      onClick={() => setSelectedCity('parnaiba')}
                      className="absolute top-[15%] right-[20%] w-6 h-6 rounded-full bg-[#42a5f5] border-2 border-white hover:scale-110 transition-transform shadow-lg"
                      title="Parnaíba"
                    />

                    {/* Picos */}
                    <button
                      onClick={() => setSelectedCity('picos')}
                      className="absolute bottom-[35%] left-[25%] w-6 h-6 rounded-full bg-[#ff6b35] border-2 border-white hover:scale-110 transition-transform shadow-lg"
                      title="Picos"
                    />

                    {/* Floriano */}
                    <button
                      onClick={() => setSelectedCity('floriano')}
                      className="absolute top-[60%] right-[15%] w-6 h-6 rounded-full bg-[#32cd32] border-2 border-white hover:scale-110 transition-transform shadow-lg"
                      title="Floriano"
                    />

                    {/* Campo Maior */}
                    <button
                      onClick={() => setSelectedCity('campo_maior')}
                      className="absolute bottom-[15%] right-[10%] w-6 h-6 rounded-full bg-[#f7931e] border-2 border-white hover:scale-110 transition-transform shadow-lg"
                      title="Campo Maior"
                    />

                    {/* Oeiras */}
                    <button
                      onClick={() => setSelectedCity('oeiras')}
                      className="absolute bottom-[45%] right-[25%] w-6 h-6 rounded-full bg-[#9370db] border-2 border-white hover:scale-110 transition-transform shadow-lg"
                      title="Oeiras"
                    />

                    {/* Bom Jesus */}
                    <button
                      onClick={() => setSelectedCity('bom_jesus')}
                      className="absolute top-[25%] left-[15%] w-6 h-6 rounded-full bg-[#dc143c] border-2 border-white hover:scale-110 transition-transform shadow-lg"
                      title="Bom Jesus"
                    />
                  </div>

                  {/* Controles de zoom */}
                  <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <Button className="w-10 h-10 rounded border-2 bg-[#3a3a3a] border-[#8b4513] text-white hover:bg-[#4a4a4a]">
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button className="w-10 h-10 rounded border-2 bg-[#3a3a3a] border-[#8b4513] text-white hover:bg-[#4a4a4a]">
                      <Minus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Outras abas */}
          {activeTab !== 'mapa' && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#3a3a3a]">
                  {activeTab === 'missoes' && <Sword className="h-10 w-10 text-[#d4af37]" />}
                  {activeTab === 'ranking' && <Trophy className="h-10 w-10 text-[#d4af37]" />}
                  {activeTab === 'forum' && <MessageCircle className="h-10 w-10 text-[#d4af37]" />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {activeTab === 'missoes' && 'Missões'}
                  {activeTab === 'ranking' && 'Ranking'}
                  {activeTab === 'forum' && 'Fórum'}
                </h2>
                <p className="text-[#b8860b]">Em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de informações do Reino */}
      <Dialog open={showKingdomInfo} onOpenChange={setShowKingdomInfo}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a2a2a] border-[#8b4513]">
          <DialogHeader>
            <DialogTitle className="text-[#d4af37] text-xl flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Reino Educacional do Piauí
            </DialogTitle>
          </DialogHeader>
          <div className="text-white space-y-4">
            <p className="text-[#b8860b]">Explorar Vilarejo:</p>
            <div className="space-y-2">
              {Object.entries(cidades).map(([key, cidade]) => (
                <div 
                  key={key}
                  className="p-3 rounded border border-[#8b4513] bg-[#3a3a3a] hover:bg-[#4a4a4a] cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedCity(key);
                    setShowKingdomInfo(false);
                  }}
                >
                  <p className="text-white">{cidade.nome}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de informações da cidade */}
      <Dialog open={!!selectedCity} onOpenChange={() => setSelectedCity(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#f5f5dc] border-[#8b4513]">
          {selectedCity && cidades[selectedCity] && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#8b4513] text-xl flex items-center justify-between">
                  {cidades[selectedCity].nome}
                  <Button
                    onClick={() => setSelectedCity(null)}
                    variant="ghost"
                    className="h-6 w-6 p-0 text-[#8b4513] hover:bg-[#e5e5dc]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-[#654321]">{cidades[selectedCity].descricao}</p>
                
                <div>
                  <h3 className="text-[#8b4513] font-bold text-lg mb-3">Características Místicas:</h3>
                  <ul className="space-y-2">
                    {cidades[selectedCity].caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="text-[#654321] flex items-start gap-2">
                        <span className="text-[#d4af37] mt-2">•</span>
                        <span>{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}