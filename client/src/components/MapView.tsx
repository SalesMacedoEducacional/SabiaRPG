import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import mapaImage from '@/assets/mapa.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

interface MapLocationProps {
  location: {
    id: number;
    name: string;
    description: string;
    coordinates: { x: number; y: number };
    icon: string;
    unlockLevel: number;
  };
  isLocked: boolean;
  isActive: boolean;
  onClick: () => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ location, isLocked, isActive, onClick }) => {
  const getIconClass = () => {
    switch (location.icon) {
      case 'castle':
        return 'fa-castle';
      case 'water':
        return 'fa-water';
      case 'landmark':
        return 'fa-landmark';
      case 'mountain':
        return 'fa-mountain';
      default:
        return 'fa-map-marker';
    }
  };

  const size = isActive ? 'w-12 h-12' : 'w-10 h-10';
  const bg = isLocked ? 'bg-dark-light' : 
             (location.icon === 'castle' ? 'bg-primary-dark' : 
             location.icon === 'water' ? 'bg-secondary-dark' :
             location.icon === 'landmark' ? 'bg-primary-light' :
             'bg-secondary');
  
  const borderColor = isLocked ? 'border-primary-dark' : 'border-accent';
  const textColor = isLocked ? 'text-parchment-dark' : 'text-accent';

  return (
    <div 
      className={`map-point absolute cursor-pointer group`}
      style={{
        top: `${location.coordinates.y}%`,
        left: `${location.coordinates.x}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`${size} ${bg} border-2 ${borderColor} rounded-full flex items-center justify-center shadow-lg z-10`}>
          <i className={`fas ${getIconClass()} ${textColor} text-xl`}></i>
        </div>
        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 ${bg} border-2 ${borderColor} rotate-45`}></div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-dark p-2 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
          <p className="font-medieval text-accent">{location.name}</p>
          <p className="text-xs text-parchment">
            {isLocked ? `Desbloqueado no nível ${location.unlockLevel}` : location.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const MapPathConnection: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  isCompleted: boolean;
  isActive: boolean;
}> = ({ from, to, isCompleted, isActive }) => {
  const pathClass = isCompleted ? 'stroke-accent' : 
                  isActive ? 'stroke-accent opacity-60' : 'stroke-primary-dark';
  
  const dashStyle = {
    strokeDasharray: '5,3',
    strokeDashoffset: isActive || isCompleted ? '0' : '750',
  };

  return (
    <path 
      d={`M${from.x},${from.y} Q${(from.x + to.x) / 2 + (to.y - from.y) / 4},${(from.y + to.y) / 2 - (to.x - from.x) / 4} ${to.x},${to.y}`}
      fill="none" 
      stroke="currentColor" 
      className={pathClass}
      strokeWidth="1.5"
      style={dashStyle}
    />
  );
};

const MapView: React.FC = () => {
  const { locations, learningPaths, startMission } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Dados das cidades do Reino Educacional do Piauí
  const cityInfo = {
    'teresina': {
      name: 'Teresina – A Cidade das Duas Correntes',
      description: 'Fortaleza Arcanomural: As muralhas de pedra negra são cravadas de runas que se acendem à noite, alimentadas pelo cristal pulsante no centro.',
      features: [
        'Esfera do Conclave: O cristal mágico emite um brilho prateado que flutua acima da praça central, conferindo proteção contra ataques de criaturas sombrias.',
        'Legião dos Vigias Azuis: Guardiões encapuzados patrulham torres gêmeas, montados em grifos menores.',
        'Rios Viventes: As fitas azuis formam o "Caminho de Lamen", correntes encantadas que conduzem viajantes místicos até portais submersos.',
        'Mercadores de Pergaminhos: Ao longo dos fossos, tendas vendem mapas de tesouros e poções de visão aquática.'
      ]
    },
    'serra-capivara': {
      name: 'Serra da Capivara – O Desfiladeiro Ancestral',
      description: 'Cânions Sangrentos: Rochas avermelhadas são marcadas por ecochifres–antigos espíritos de bisões que uivam ao luar.',
      features: [
        'Galeria das Runas Perdidas: Gravuras rupestres ganham vida ao serem tocadas por lanternas de cristal, revelando profecias antigas.',
        'Guardião dos Penhascos: Um golem de pedra com olhos de âmbar vigia a região e desafia aventureiros a decifrar seus enigmas.',
        'Oásis Fantasma: Pequenas lagoas escondem ninfas da caatinga, que oferecem bênçãos de resiliência aos exploradores dignos.'
      ]
    },
    'parnaiba': {
      name: 'Delta do Parnaíba – As Corredeiras Encantadas',
      description: 'Ilha das Sereianas: No labirinto de canais, pequenas sereias rudimentares tecem redes de magia para atrair heróis.',
      features: [
        'Barcos do Bardo: Em balsas movidas por magos-barqueiros, minstrels cantam lendas perdidas enquanto navegam.',
        'Manguezal Sombrio: Árvores retorcidas guardam ninhos de "Polvo-Feiticeiro", cujos tentáculos expelem poções de cura.',
        'Cristais de Maré Alta: Bancos de areia abrigam gemas que mudam de cor conforme a maré, usadas em rituais de transmutação.'
      ]
    },
    'oeiras': {
      name: 'Oeiras – O Enclave Barroco',
      description: 'Igreja dos Ecos: Ao tocar o sino talhado em mármore negro, vozes ancestrais sussurram segredos de ordem e caos.',
      features: [
        'Pátio do Conclave Solar: Lanternas mágicas soltam fagulhas douradas que energizam feudos e permitem voos breves de corujas encantadas.',
        'Aldeões-Arcanos: Clérigos de sabedoria vendem pergaminhos de bênçãos, mas cobram missões de resgate de relíquias sagradas.',
        'Ruas que Se Reconfiguram: À meia-noite, o calçamento muda de posição, revelando passagens secretas para criptas subterrâneas.'
      ]
    },
    'bom-jesus': {
      name: 'Bom Jesus – Os Morros da Fé',
      description: 'Escadaria Celestial: Degraus de mármore se iluminam sob pegadas honestas, guiando os justos até capelas suspensas que flutuam em nuvens.',
      features: [
        'Cruz de Sol e Lua: No ápice, arcanos convergem para um portal que só se abre durante eclipses, permitindo viagens interplanares.',
        'Irmãs Miríades: Ordens de freiras místicas cuidam de oráculos vivos, dispensando bênçãos de regeneração a quem provar virtude.'
      ]
    },
    'floriano': {
      name: 'Floriano – A Ponte dos Destinos',
      description: 'Arco das Almas: A ponte arqueada emite um som etéreo quando atravessada, anunciando o espírito dos ancestrais.',
      features: [
        'Cúpulas dos Sussurros: Cúpulas refletem orações em ecos distantes, capazes de revelar esconderijos de monstros aquáticos.',
        'Barcos Fantasmagóricos: Em noites de neblina, navios sem tripulação flutuam no rio, guiando ou enganando marinheiros.',
        'Guardiões do Véu: Estátuas de pedra sobem à vida para testar a coragem dos viajantes.'
      ]
    },
    'picos': {
      name: 'Picos – A Feira do Crepúsculo',
      description: 'Barracas do Arcano: Tendas vendem itens mágicos — de poções de aura até pergaminhos de invocação de luz.',
      features: [
        'Carroça do Alquimista: Um velho eremita troca ingredientes raros por histórias de heróis.',
        'Torre de Observação: Vigias em torres cerimoniais usam telescópios mágicos para prever tempestades de magia.',
        'Caminhos Encantados: Pedras do calçamento mudam de cor para indicar o caminho aos guardiões da feira.'
      ]
    },
    'piracuruca': {
      name: 'Piracuruca – A Estação dos Vagões de Fumaça',
      description: 'Locomotiva Idílica: A locomotiva a vapor é guiada por um maquinista espectral que oferece caronas interdimensionais.',
      features: [
        'Trilhos de Faísca: Trilhos brilham à noite, conduzindo heróis a fortalezas ocultas.',
        'Plataforma dos Sonhos: Passeiros estranhos (nível elemental ar) aparecem para propor testes de coragem.',
        'Guarda-Freio de Ferro: Um autômato colossal cuida da segurança, disparando vapor incandescente contra intrusos.'
      ]
    },
    'jaicos': {
      name: 'Jaicós – O Santuário dos Ritmos',
      description: 'Máscaras Vivazes: Máscaras tradicionais ganham vida e dançam na lua, convocando espíritos protetores.',
      features: [
        'Tambores de Chama: Ao serem tocados, produzem chamas azuis que revelam caminhos invisíveis.',
        'Danças Sacras: Grupo de bardos folclóricos ensina rituais de invocação de boas colheitas.',
        'Casarões Iluminados: Janelas em lanternas azuis guiam viajantes perdidos.'
      ]
    },
    'barras': {
      name: 'Barras – O Bazar das Mil Estrelas',
      description: 'Balança do Destino: Quem pesa um objeto tem sua sorte e futuro escritos em runas na prancha de madeira.',
      features: [
        'Barracas Errantes: Algumas se movem sozinhas, levando curiosos a vilarejos distantes.',
        'Fonte de Vidro: Jatos d\'água se transformam em fragmentos de cristal que podem ser forjados em armas rúnicas.',
        'Sacadas de Observação: Mercadores-espiões vigiam de sacadas ornamentadas, trocando segredos por ouro.'
      ]
    },
    'paulistana': {
      name: 'Paulistana – As Planícies da Locomotiva',
      description: 'Trens Erráticos: Vagões sem trilhos aparecem em estradas de terra, levando passageiros a reinos perdidos.',
      features: [
        'Caatinga Encantada: Arbustos espinhosos florescem à luz da lua, liberando pólen místico que cura feridas.',
        'Vagão do Artífice: Um velho engenheiro criou uma forja ambulante que produz engrenagens mágicas.',
        'Túnel do Tempo: Pequenas ruínas evocam ecos de batalhas antigas, marcadas por faíscas de energia temporal.'
      ]
    },
    'campo-maior': {
      name: 'Campo Maior – O Vale dos Canhões',
      description: 'Canhões Antigos: Arrombados mas ainda carregados com balas encantadas que explodem em nuvens de luz.',
      features: [
        'Bandeiras Etéreas: Tremulam sem vento, marcando zonas de proteção contra invasões demoníacas.',
        'Obelisco Sagrado: No centro, um pedestal irradia um escudo mágico que protege toda a região.',
        'Colinas Sussurrantes: Ventos carregam vozes de generais ancestrais, inspirando exércitos aliados ao amanhecer.'
      ]
    }
  };

  // Posições dos pontos informativos no mapa (em porcentagem)
  const cityPoints = [
    { id: 'teresina', x: 50, y: 35, name: 'Teresina' },
    { id: 'serra-capivara', x: 20, y: 70, name: 'Serra da Capivara' },
    { id: 'parnaiba', x: 25, y: 15, name: 'Parnaíba' },
    { id: 'oeiras', x: 70, y: 60, name: 'Oeiras' },
    { id: 'bom-jesus', x: 85, y: 25, name: 'Bom Jesus' },
    { id: 'floriano', x: 65, y: 45, name: 'Floriano' },
    { id: 'picos', x: 85, y: 50, name: 'Picos' },
    { id: 'piracuruca', x: 30, y: 25, name: 'Piracuruca' },
    { id: 'jaicos', x: 45, y: 65, name: 'Jaicós' },
    { id: 'barras', x: 40, y: 80, name: 'Barras' },
    { id: 'paulistana', x: 75, y: 75, name: 'Paulistana' },
    { id: 'campo-maior', x: 90, y: 85, name: 'Campo Maior' }
  ];

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !mapRef.current) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!mapRef.current || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ 
      x: e.touches[0].clientX - pan.x, 
      y: e.touches[0].clientY - pan.y 
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !mapRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleLocationClick = (locationId: number) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;
    
    if (user && location.unlockLevel > user.level) {
      toast({
        title: "Localização bloqueada",
        description: `Esta localização será desbloqueada no nível ${location.unlockLevel}.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedLocation(prevId => prevId === locationId ? null : locationId);
    
    // Get available learning paths for this location
    const availablePaths = learningPaths.filter(path => path.locationId === locationId);
    
    if (availablePaths.length === 0) {
      toast({
        title: "Nenhuma missão disponível",
        description: "Esta localização ainda não possui missões disponíveis.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Map Container */}
      <div 
        id="map-container" 
        className="relative w-full h-full overflow-hidden bg-map-pattern bg-cover bg-center"
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1594818379496-da1e345388c0?q=80&w=1964&auto=format&fit=crop')",
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Interactive Map Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div 
            className="relative transform-gpu"
            style={{
              width: '1536px',
              height: '1024px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* Stylized Map Border */}
            <div className="absolute inset-0 border-8 border-primary rounded-xl opacity-70"></div>
            
            {/* Map Content */}
            <div className="relative bg-parchment-dark rounded-lg overflow-hidden w-full h-full">
              {/* Map Image */}
              <div className="relative w-full h-full">
                {/* Map Illustration */}
                <img 
                  src={mapaImage} 
                  alt="Reino Educacional do Piauí - Mapa Interativo" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
                
                {/* Map Locations - Interactive Points */}
                {locations.map(location => (
                  <MapLocation 
                    key={location.id}
                    location={location}
                    isLocked={user ? user.level < location.unlockLevel : true}
                    isActive={selectedLocation === location.id}
                    onClick={() => handleLocationClick(location.id)}
                  />
                ))}
                
                {/* Path Connections (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Connection paths between locations */}
                  {locations.length >= 2 && (
                    <>
                      <MapPathConnection 
                        from={locations[0].coordinates} 
                        to={locations[1].coordinates} 
                        isCompleted={true}
                        isActive={false}
                      />
                      
                      {locations.length >= 3 && (
                        <MapPathConnection 
                          from={locations[0].coordinates} 
                          to={locations[2].coordinates} 
                          isCompleted={false}
                          isActive={true}
                        />
                      )}
                      
                      {locations.length >= 4 && (
                        <MapPathConnection 
                          from={locations[2].coordinates} 
                          to={locations[3].coordinates} 
                          isCompleted={false}
                          isActive={false}
                        />
                      )}
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button 
            onClick={handleZoomIn} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-primary hover:bg-primary transition"
            disabled={zoomLevel >= 2.5}
            variant="ghost"
            size="icon"
          >
            <ZoomIn className="h-5 w-5 text-parchment" />
          </Button>
          <Button 
            onClick={handleZoomOut} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-primary hover:bg-primary transition"
            disabled={zoomLevel <= 0.75}
            variant="ghost"
            size="icon"
          >
            <ZoomOut className="h-5 w-5 text-parchment" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
