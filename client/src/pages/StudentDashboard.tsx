import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  Info,
  MapPin,
  Search,
  Shield,
  CheckCircle,
  Play,
  Pause,
  Award,
  Menu
} from 'lucide-react';
import mapaImg from '@assets/mapa_1750435067177.png';
import logoImg from '@assets/image_1750454766181.png';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');
  const [selectedCity, setSelectedCity] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showKingdomInfo, setShowKingdomInfo] = useState(false);
  const [showVillageMenu, setShowVillageMenu] = useState(false);
  const [villageFilter, setVillageFilter] = useState('');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [selectedVillageStory, setSelectedVillageStory] = useState(null);

  // Dados dos 12 vilarejos
  const vilarejos = [
    {
      id: 'teresina',
      nome: 'Teresina',
      descricao: 'Área central com muralhas medievais, confluência de dois rios e um núcleo mágico brilhante sinalizando a capital.',
      posicao: { top: '45%', left: '50%' }
    },
    {
      id: 'serra_capivara',
      nome: 'Serra da Capivara (São Raimundo Nonato)',
      descricao: 'Cânions vermelhos esculpidos, pinturas rupestres em rochas e figuras de animais pré-históricos.',
      posicao: { top: '30%', left: '25%' }
    },
    {
      id: 'delta_parnaiba',
      nome: 'Delta do Parnaíba (Parnaíba)',
      descricao: 'Labirinto de canais sinuosos, barcos flutuando, vegetação exuberante e ícone de criatura aquática.',
      posicao: { top: '15%', right: '20%' }
    },
    {
      id: 'oeiras',
      nome: 'Oeiras',
      descricao: 'Aldeia colonial com igreja barroca, ruas de pedra e telhados envelhecidos.',
      posicao: { bottom: '45%', right: '25%' }
    },
    {
      id: 'bom_jesus',
      nome: 'Bom Jesus',
      descricao: 'Cidade no alto de morros, igrejas elevadas, símbolos espirituais e cruzes históricas.',
      posicao: { top: '25%', left: '15%' }
    },
    {
      id: 'floriano',
      nome: 'Floriano',
      descricao: 'Vila ribeirinha com cúpulas antigas, pontes de pedra sobre o rio e casarões imponentes.',
      posicao: { top: '60%', right: '15%' }
    },
    {
      id: 'picos',
      nome: 'Picos',
      descricao: 'Feira medieval, tendas coloridas, carroças e torres de vigia intercaladas por ruas de pedra.',
      posicao: { bottom: '35%', left: '25%' }
    },
    {
      id: 'piracuruca',
      nome: 'Piracuruca',
      descricao: 'Estação ferroviária centenária, trilhos sinuosos e um trem a vapor detalhado.',
      posicao: { top: '20%', left: '40%' }
    },
    {
      id: 'jaicos',
      nome: 'Jaicós',
      descricao: 'Praça folclórica com máscaras culturais, tambores vibrantes e construções tradicionais.',
      posicao: { bottom: '25%', left: '35%' }
    },
    {
      id: 'barras',
      nome: 'Barras',
      descricao: 'Mercado colonial animado, sacadas ornamentadas e barracas de comércio com balanças antigas.',
      posicao: { top: '35%', left: '30%' }
    },
    {
      id: 'paulistana',
      nome: 'Paulistana',
      descricao: 'Semiárido com caatinga, ferrovia cortando o solo e trem da Transnordestina em movimento.',
      posicao: { bottom: '15%', right: '10%' }
    },
    {
      id: 'campo_maior',
      nome: 'Campo Maior',
      descricao: 'Campo de batalha histórico, canhões, colinas onduladas e monumento central com bandeiras erguida.',
      posicao: { bottom: '45%', left: '40%' }
    }
  ];

  const filteredVilarejos = vilarejos.filter(vilarejo =>
    vilarejo.nome.toLowerCase().includes(villageFilter.toLowerCase())
  );

  // Dados das missões do aluno
  const missoesData = {
    concluidas: 3,
    emProgresso: 2,
    naoIniciadas: 7
  };

  // Histórias completas dos vilarejos
  const vilarejosHistorias = {
    teresina: {
      titulo: "Teresina",
      historia: "Encravada entre muralhas de pedra cinzenta, Teresina exibe torres elevadas que recolhem o amarelo do sol nascente. O burburinho dos cais e o perfume de especiarias vindas dos mercados ecoam ao longo dos rios que se unem em Y, onde barqueiros entoam cânticos de bênção. À noite, tochas revelam brasões gravados nos portões medievais e crianças correm sob o arco central, ansiosas por histórias de antigos guardiões."
    },
    serra_capivara: {
      titulo: "Serra da Capivara (São Raimundo Nonato)",
      historia: "Nos penhascos vermelhos da Serra, o sopro do vento arrasta poeira que dança sobre pinturas rupestres milenares. Xamãs e caçadores, em vestes de couro curtido, traçam novos símbolos ao redor de fogueiras crepitantes, acreditando que ali residem as almas dos primeiros sábios. O eco de tambores primitivos mistura-se ao canto distante de aves de rapina, lembrando que aquele solo guarda segredos de eras imemoriais."
    },
    delta_parnaiba: {
      titulo: "Delta do Parnaíba (Parnaíba)",
      historia: "Águas translúcidas serpenteiam por entre manguezais e bancos de areia, refletindo palmeiras que se inclinam como guardiãs da foz. Pescadores em pequenos barcos de madeira deslizam silenciosos, lançando redes bordadas por conchas e contando lendas de criaturas anfíbias que emergem à lua cheia. O ar úmido traz cheiro de sal e algas, enquanto pássaros coloridos se agitam nos cipós pendentes."
    },
    oeiras: {
      titulo: "Oeiras",
      historia: "Ruelas de paralelepípedos conduzem ao claustro da igreja barroca, onde vitrais tingem de rubi e esmeralda os bancos de madeira entalhada. Donzelas em vestidos de linho cruzam praças onde merceeiros oferecem ervas medicinais e cerâmicas artesanais. Ao cair da tarde, o sino ressoa acompanhado do tilintar dos sinos menores, engalanando o ar com promessas de fé e histórias de padres viajantes."
    },
    bom_jesus: {
      titulo: "Bom Jesus",
      historia: "No alto de colinas verdejantes, capelas brancas e torres adornadas com cruzes de ferro velado avistam vales cobertos de neblina matinal. Peregrinos de todas as estradas trazem velas acesas, formando um tapete de luz que acende orações silenciosas. O aroma de incenso misterioso paira sobre procissões solenes, enquanto sinos saudosos sopram notas que atravessam duas léguas de campos ondulantes."
    },
    floriano: {
      titulo: "Floriano",
      historia: "Entre margens urdidas por pontes de pedra, o rio murmura segredos que remontam a caravanas de comerciantes. Cúpulas amarelas reluzem sob o sol poente, refletidas em águas calmas, enquanto ribeirinhos trocam histórias de naufrágios e tesouros esquecidos. Ao longe, moinhos de vento giram lentamente, misturando o farfalhar das folhas ao canto de coqueiros."
    },
    picos: {
      titulo: "Picos",
      historia: "Sob bandeiras coloridas de festival medieval, carroças carregam barris de mel, pimentas e tecidos finos até grandes tendas de lona. Côros de menestréis entoam violas e gaitas, embalando danças circulares na praça onde vigias vigiam desde as torres de vigia. O tilintar de moedas ecoa nos becos, enquanto artesãos esculpem brasões de família em madeira nobre."
    },
    piracuruca: {
      titulo: "Piracuruca",
      historia: "O apito retumbante do trem a vapor desperta lembranças de jornadas épicas por trilhos rústicos. A estação de pedra abriga bancos esculpidos e afiadores de lâminas que afiavam facas de bordo dos viajantes. Vapor e fumaça se entrelaçam ao aroma de café torrado, servindo de convite para viajantes trocarem cartas e confidências sob lanternas de óleo."
    },
    jaicos: {
      titulo: "Jaicós",
      historia: "Máscaras cerâmicas, talhadas com simbolismos tribais, enfeitam as fachadas das casas de taipa, enquanto tambores de couro ressoam na praça central. Filhos dos ancestrais dançam ao redor de fogueiras, vestindo colares de sementes coloridas e penas de arara. Aromas de gengibre e erva-doce percorrem barracas de remedinhos, saudando a sabedoria dos curandeiros locais."
    },
    barras: {
      titulo: "Barras",
      historia: "Palácios coloniais de sacadas ornamentadas cercam a praça de mercado, onde pesadores medem grãos dourados em balanças de ferro fundido. Mercadores percorrem barracas com tecidos estampados, cerâmicas esmaltadas e quintais de especiarias. O-negrejar de cavalos e o tilintar das ferraduras ecoam entre arcos e fontes, compondo uma sinfonia de trocas e encontros."
    },
    paulistana: {
      titulo: "Paulistana",
      historia: "Cactos retorcidos e mandacarus revelam a dureza da caatinga, enquanto trilhos atravessam o solo rachado rumo ao trem de ferro-clássico. Vagões carregam donativos e memórias de expedições sertanejas, homenageadas por violeiros entoando modas de viola. O vento quente carrega poeira avermelhada que aos poucos se assenta sobre vagões e estações abandonadas."
    },
    campo_maior: {
      titulo: "Campo Maior",
      historia: "Colinas verticais guardam trincheiras e canhões enferrujados, testemunhas de combates que decidiram reinos. Bandeiras pendem de mastros tortos, ainda ostentando brasões de velhas alianças. Soldados em armaduras clip-clop marcham silenciosos, e ao longe, uma espada cravada em pedra reaviva lendas de pactos e renovações."
    }
  };

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
          <Crown className="h-12 w-12 text-[#D4A054] mx-auto mb-4 animate-spin" />
          <p className="text-white text-lg">Carregando seu reino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b" 
              style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
        {/* Logo SABIÁ RPG */}
        <div className="flex items-center gap-3">
          <img 
            src="/attached_assets/LOGOSABIA_1750458941873.png" 
            alt="SABIÁ RPG" 
            className="h-8 w-auto object-contain md:h-6 sm:h-5"
          />
          <span className="text-xl font-bold text-[#D4A054] md:text-lg sm:text-base">SABIÁ RPG</span>
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
            <Star className="h-4 w-4 text-[#D4A054]" />
            <span>{dadosAluno.xp_total} XP</span>
            <span className="text-[#b8860b]">|</span>
            <span>Nível {dadosAluno.nivel}</span>
          </div>
          
          {/* Dropdown do perfil */}
          <div className="relative">
            <Button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-[#D4A054]"
              style={{ backgroundColor: '#8b4513' }}
            >
              AL
            </Button>
            
            {showProfile && (
              <div className="absolute right-0 top-10 w-48 rounded border shadow-lg z-50"
                   style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                <div className="p-3 border-b" style={{ borderColor: '#D4A054' }}>
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
        <div className="w-60 p-4 border-r" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
          {/* Avatar e Info */}
          <div className="text-center mb-6">
            <div className="relative mx-auto mb-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-2"
                   style={{ backgroundColor: '#8b4513', borderColor: '#D4A054' }}>
                AL
              </div>
              <div className="absolute -top-2 -right-2 bg-[#D4A054] text-black text-xs px-2 py-1 rounded-full font-bold">
                Nv. 1
              </div>
            </div>
            <p className="text-white text-sm mb-1">aluno@sabiarpg.edu.br</p>
            <p className="text-[#b8860b] text-xs">Aprendiz de Sabedoria</p>
          </div>

          {/* Atributos com cores dos componentes */}
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide text-[#D4A054]">ATRIBUTOS</h4>
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
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wide text-[#D4A054]">CONQUISTAS</h4>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="w-8 h-8 rounded border flex items-center justify-center bg-[#3a3a3a] border-[#8b4513]">
                  <span className="text-gray-600 text-xs">???</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nível */}
          <div className="rounded p-4 border" style={{ backgroundColor: '#3a3a3a', borderColor: '#D4A054' }}>
            <div className="text-center mb-3">
              <div className="text-sm font-bold mb-1 text-[#D4A054]">Nível 1</div>
              <div className="text-xs text-[#b8860b]">0/1000 XP</div>
            </div>
            <div className="text-xs mb-2 text-[#b8860b]">1000 XP para o próximo nível</div>
            <div className="w-full rounded h-2 bg-[#2a2a2a]">
              <div className="h-2 rounded bg-[#D4A054]" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'mapa' && (
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Área do Mapa */}
              <div className="w-full lg:flex-1">
                <div className="flex-1 p-6">
                  <div className="relative h-full min-h-[500px] rounded-lg overflow-hidden shadow-2xl border-2" 
                       style={{ borderColor: '#D4A054' }}>
                    <img 
                      src={mapaImg} 
                      alt="Reino Educacional do Piauí"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Menu Sanduíche - Canto Superior Esquerdo */}
                    <div className="absolute top-4 left-4">
                      <Button
                        onClick={() => setShowSideMenu(true)}
                        className="p-3 rounded-full shadow-lg border-2 hover:opacity-80"
                        style={{ 
                          backgroundColor: '#D4A054', 
                          borderColor: '#312E26',
                          color: '#312E26'
                        }}
                      >
                        <Menu className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Marcador animado se uma cidade foi selecionada */}
                    {selectedCity && (
                      <div 
                        className="absolute w-6 h-6 rounded-full border-2 border-white animate-pulse"
                        style={{ 
                          backgroundColor: '#D4A054',
                          ...vilarejos.find(v => v.id === selectedCity)?.posicao,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar de Cards de Missões - Desktop */}
              <div className="hidden lg:block w-80 p-6 border-l" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                <h3 className="text-[#D4A054] font-bold text-lg mb-6 flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Status das Missões
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded border" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4A054] font-bold text-sm">Missões Concluídas</span>
                      <CheckCircle className="h-5 w-5 text-[#D4A054]" />
                    </div>
                    <div className="text-[#F5F2E7] text-2xl font-bold mb-1">{missoesData.concluidas}</div>
                    <div className="text-[#D4A054] text-xs">Missões completadas</div>
                  </div>

                  <div className="p-4 rounded border" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4A054] font-bold text-sm">Missões em Progresso</span>
                      <Play className="h-5 w-5 text-[#D4A054]" />
                    </div>
                    <div className="text-[#F5F2E7] text-2xl font-bold mb-1">{missoesData.emProgresso}</div>
                    <div className="text-[#D4A054] text-xs">Em andamento</div>
                  </div>

                  <div className="p-4 rounded border" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4A054] font-bold text-sm">Missões Não Iniciadas</span>
                      <Pause className="h-5 w-5 text-[#D4A054]" />
                    </div>
                    <div className="text-[#F5F2E7] text-2xl font-bold mb-1">{missoesData.naoIniciadas}</div>
                    <div className="text-[#D4A054] text-xs">Aguardando início</div>
                  </div>
                </div>
              </div>

              {/* Cards de Missões - Tablet/Mobile */}
              <div className="lg:hidden p-4" style={{ backgroundColor: '#312E26' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded border text-center" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <CheckCircle className="h-6 w-6 text-[#D4A054] mx-auto mb-2" />
                    <div className="text-[#F5F2E7] text-xl font-bold">{missoesData.concluidas}</div>
                    <div className="text-[#D4A054] text-xs">Concluídas</div>
                  </div>
                  
                  <div className="p-4 rounded border text-center" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <Play className="h-6 w-6 text-[#D4A054] mx-auto mb-2" />
                    <div className="text-[#F5F2E7] text-xl font-bold">{missoesData.emProgresso}</div>
                    <div className="text-[#D4A054] text-xs">Em Progresso</div>
                  </div>
                  
                  <div className="p-4 rounded border text-center" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <Pause className="h-6 w-6 text-[#D4A054] mx-auto mb-2" />
                    <div className="text-[#F5F2E7] text-xl font-bold">{missoesData.naoIniciadas}</div>
                    <div className="text-[#D4A054] text-xs">Não Iniciadas</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Missões */}
          {activeTab === 'missoes' && (
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="flex-1 p-6">
                {/* Cards de Estatísticas - Responsivo */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#F5F2E7] text-sm">Nível Atual</span>
                      <Crown className="h-4 w-4 text-[#D4A054]" />
                    </div>
                    <div className="text-[#D4A054] text-2xl font-bold">3</div>
                    <div className="text-[#D4A054] text-xs">250 XP para próximo nível</div>
                  </div>

                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#F5F2E7] text-sm">XP Total</span>
                      <Star className="h-4 w-4 text-[#D4A054]" />
                    </div>
                    <div className="text-[#D4A054] text-2xl font-bold">2.750</div>
                    <div className="text-[#D4A054] text-xs">Experiência acumulada</div>
                  </div>

                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#F5F2E7] text-sm">Ranking</span>
                      <Trophy className="h-4 w-4 text-[#D4A054]" />
                    </div>
                    <div className="text-[#D4A054] text-2xl font-bold">#12</div>
                    <div className="text-[#D4A054] text-xs">de 124 alunos</div>
                  </div>

                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#F5F2E7] text-sm">Conquistas</span>
                      <Award className="h-4 w-4 text-[#D4A054]" />
                    </div>
                    <div className="text-[#D4A054] text-2xl font-bold">2</div>
                    <div className="text-[#D4A054] text-xs">de 45 disponíveis</div>
                  </div>
                </div>

                {/* Missões Ativas */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#F5F2E7] mb-6">Missões Ativas</h2>
                  
                  <div className="space-y-4">
                    <div className="p-6 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#F5F2E7] font-bold">A Busca pelos Números Perdidos</h3>
                        <Button className="px-4 py-2 rounded text-sm" style={{ backgroundColor: '#D4A054', color: '#1a1a1a' }}>
                          Continuar
                        </Button>
                      </div>
                      <p className="text-[#D4A054] text-sm mb-4">Encontre os números perdidos escondidos no Reino da Matemática</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#F5F2E7]">matemática</span>
                        <span className="text-[#D4A054]">150 XP</span>
                        <span className="text-[#D4A054]">25min</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#F5F2E7] font-bold">As Crônicas das Palavras</h3>
                        <Button className="px-4 py-2 rounded text-sm" style={{ backgroundColor: '#D4A054', color: '#1a1a1a' }}>
                          Iniciar
                        </Button>
                      </div>
                      <p className="text-[#D4A054] text-sm mb-4">Desvende os mistérios da linguagem escrita</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#F5F2E7]">português</span>
                        <span className="text-[#D4A054]">120 XP</span>
                        <span className="text-[#D4A054]">15min</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg border" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#F5F2E7] font-bold">Expedição ao Laboratório Secreto</h3>
                        <Button className="px-4 py-2 rounded text-sm" style={{ backgroundColor: '#D4A054', color: '#1a1a1a' }}>
                          Concluída
                        </Button>
                      </div>
                      <p className="text-[#D4A054] text-sm mb-4">Conduza experimentos para descobrir os segredos da natureza</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#F5F2E7]">ciências</span>
                        <span className="text-[#D4A054]">200 XP</span>
                        <span className="text-[#D4A054]">45min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar de Cards de Missões - Desktop (repetida para consistência) */}
              <div className="hidden lg:block w-80 p-6 border-l" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
                <h3 className="text-[#D4A054] font-bold text-lg mb-6 flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Status das Missões
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded border" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4A054] font-bold text-sm">Missões Concluídas</span>
                      <CheckCircle className="h-5 w-5 text-[#D4A054]" />
                    </div>
                    <div className="text-[#F5F2E7] text-2xl font-bold mb-1">{missoesData.concluidas}</div>
                    <div className="text-[#D4A054] text-xs">Missões completadas</div>
                  </div>

                  <div className="p-4 rounded border" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4A054] font-bold text-sm">Missões em Progresso</span>
                      <Play className="h-5 w-5 text-[#D4A054]" />
                    </div>
                    <div className="text-[#F5F2E7] text-2xl font-bold mb-1">{missoesData.emProgresso}</div>
                    <div className="text-[#D4A054] text-xs">Em andamento</div>
                  </div>

                  <div className="p-4 rounded border" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4A054] font-bold text-sm">Missões Não Iniciadas</span>
                      <Pause className="h-5 w-5 text-[#D4A054]" />
                    </div>
                    <div className="text-[#F5F2E7] text-2xl font-bold mb-1">{missoesData.naoIniciadas}</div>
                    <div className="text-[#D4A054] text-xs">Aguardando início</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Outras abas */}
          {(activeTab === 'ranking' || activeTab === 'forum') && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3a3a3a' }}>
                  {activeTab === 'ranking' && <Trophy className="h-10 w-10 text-[#D4A054]" />}
                  {activeTab === 'forum' && <MessageCircle className="h-10 w-10 text-[#D4A054]" />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
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
            <DialogTitle className="text-[#D4A054] text-xl flex items-center gap-2">
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

      {/* Modal dos Vilarejos */}
      <Dialog open={showVillageMenu} onOpenChange={setShowVillageMenu}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}>
          <DialogHeader>
            <DialogTitle className="text-[#D4A054] text-xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Vilarejos do Reinado
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Barra de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#b8860b]" />
              <Input
                placeholder="Buscar vilarejo..."
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="pl-10 bg-[#3a3a3a] border-[#D4A054] text-white placeholder:text-[#b8860b]"
              />
            </div>

            {/* Lista de vilarejos */}
            <div className="grid gap-4 max-h-[50vh] overflow-y-auto">
              {filteredVilarejos.map((vilarejo, index) => (
                <div 
                  key={vilarejo.id}
                  className="p-6 rounded-lg border cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                  style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}
                  onClick={() => {
                    setSelectedCity(vilarejo.id);
                    setShowVillageMenu(false);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                         style={{ backgroundColor: '#D4A054', color: '#1a1a1a' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#F5F2E7] font-bold text-lg mb-2">{vilarejo.nome}</h3>
                      <p className="text-[#D4A054] text-sm leading-relaxed">{vilarejo.descricao}</p>
                    </div>
                    <MapPin className="h-5 w-5 text-[#D4A054] flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {filteredVilarejos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[#b8860b]">Nenhum vilarejo encontrado.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setShowVillageMenu(false)}
              className="px-4 py-2"
              style={{ backgroundColor: '#D4A054', color: '#1a1a1a' }}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Lateral Sanduíche */}
      {showSideMenu && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSideMenu(false)}
          />
          
          {/* Panel */}
          <div 
            className="relative w-80 max-w-[90vw] h-full overflow-y-auto"
            style={{ backgroundColor: '#312E26' }}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#D4A054' }}>
              <h2 className="text-[#D4A054] font-bold text-lg">Vilarejos</h2>
              <Button
                onClick={() => setShowSideMenu(false)}
                className="p-1 rounded hover:opacity-75 transition-opacity"
                style={{ backgroundColor: 'transparent' }}
              >
                <X className="h-5 w-5 text-[#D4A054]" />
              </Button>
            </div>

            {/* Lista de Vilarejos */}
            <div className="p-4 space-y-2">
              {Object.entries(vilarejosHistorias).map(([key, vilarejo]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedVillageStory(key);
                    setShowSideMenu(false);
                  }}
                  className="w-full text-left p-3 rounded border hover:opacity-75 transition-opacity"
                  style={{ backgroundColor: '#2a2a2a', borderColor: '#D4A054' }}
                >
                  <span className="text-[#F5F2E7] font-medium">{vilarejo.titulo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de História do Vilarejo */}
      <Dialog open={!!selectedVillageStory} onOpenChange={() => setSelectedVillageStory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: '#312E26', borderColor: '#D4A054' }}>
          {selectedVillageStory && vilarejosHistorias[selectedVillageStory] && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#D4A054] text-xl font-bold flex items-center justify-between">
                  {vilarejosHistorias[selectedVillageStory].titulo}
                  <Button
                    onClick={() => setSelectedVillageStory(null)}
                    className="p-1 rounded hover:opacity-75 transition-opacity"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <X className="h-5 w-5 text-[#D4A054]" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-[#F5F2E7] text-base leading-relaxed text-justify" style={{ fontSize: '16px' }}>
                  {vilarejosHistorias[selectedVillageStory].historia}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setSelectedVillageStory(null)}
                  className="px-6 py-2 rounded font-medium"
                  style={{ backgroundColor: '#D4A054', color: '#312E26' }}
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}